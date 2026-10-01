import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  Goal,
  GoalMovement,
  PaymentMethod,
  RecurrenceFrequency,
  Transaction,
} from "@/types";
import type { FinanceState } from "@/types";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
  GOAL_DEPOSIT_CATEGORY_ID,
  GOAL_WITHDRAW_CATEGORY_ID,
  withGoalCategories,
} from "@/lib/defaults";
import { uid } from "@/lib/id";
import { generateRecurringTransactions } from "@/lib/recurrence";
import { recomputeGoals } from "@/lib/goals";
import { roundMoney } from "@/lib/money";

type NewTransaction = Omit<Transaction, "id" | "createdAt" | "recurringGroupId">;

export interface GoalContribution {
  goalId: string;
  amount: number;
  direction: GoalMovement;
  date: string;
  paymentMethodId: string;
  notes?: string;
}

/** Campos compartilhados ao editar uma série a partir de uma ocorrência. */
export type SeriesPatch = Partial<
  Pick<
    Transaction,
    | "type"
    | "name"
    | "amount"
    | "date"
    | "categoryId"
    | "paymentMethodId"
    | "notes"
    | "isRecurring"
    | "recurrence"
  >
>;

interface FinanceStore extends FinanceState {
  addTransaction: (data: NewTransaction, until?: Date) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  /** Atualiza esta ocorrência e as seguintes da mesma série. A data só muda nesta. */
  updateSeriesFrom: (id: string, data: SeriesPatch) => void;
  deleteTransaction: (id: string) => void;
  deleteRecurringGroup: (groupId: string) => void;
  /** Remove esta ocorrência e as seguintes. */
  endSeriesFrom: (id: string) => void;
  toggleSkip: (id: string) => void;
  /** Pausa esta ocorrência e as seguintes. */
  pauseSeriesFrom: (id: string) => void;
  resumeSeries: (groupId: string) => void;

  addCategory: (data: Omit<Category, "id">) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addPaymentMethod: (data: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;

  addGoal: (data: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  /** Cria o lançamento de aporte ou resgate e atualiza o valor guardado. */
  contributeToGoal: (input: GoalContribution) => void;

  setBudgets: (items: { categoryId: string; limit: number }[]) => void;

  resetAll: () => void;
  /** Substitui todo o estado (usado pela sincronização e importação). */
  replaceAll: (state: Partial<FinanceState>) => void;
}

function applySeriesFields(target: Transaction, patch: SeriesPatch, includeDate: boolean): Transaction {
  const next: Transaction = { ...target };
  if (patch.type !== undefined) next.type = patch.type;
  if (patch.name !== undefined) next.name = patch.name;
  if (patch.amount !== undefined) next.amount = patch.amount;
  if (patch.categoryId !== undefined) next.categoryId = patch.categoryId;
  if (patch.paymentMethodId !== undefined) next.paymentMethodId = patch.paymentMethodId;
  if (patch.notes !== undefined) next.notes = patch.notes;
  if (patch.isRecurring !== undefined) next.isRecurring = patch.isRecurring;
  if (patch.recurrence !== undefined) next.recurrence = patch.recurrence;
  if (includeDate && patch.date !== undefined) next.date = patch.date;
  return next;
}

function withGoals(
  goals: Goal[],
  transactions: Transaction[]
): { goals: Goal[]; transactions: Transaction[] } {
  return { transactions, goals: recomputeGoals(goals, transactions) };
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      goals: [],
      budgets: [],

      addTransaction: (data, until) =>
        set((state) => {
          if (data.isRecurring && data.recurrence && until) {
            const generated = generateRecurringTransactions(
              data,
              data.recurrence as RecurrenceFrequency,
              until
            );
            return withGoals(state.goals, [...state.transactions, ...generated]);
          }
          const tx: Transaction = {
            ...data,
            id: uid("tx"),
            createdAt: new Date().toISOString(),
          };
          return withGoals(state.goals, [...state.transactions, tx]);
        }),

      updateTransaction: (id, data) =>
        set((state) =>
          withGoals(
            state.goals,
            state.transactions.map((t) => (t.id === id ? { ...t, ...data } : t))
          )
        ),

      updateSeriesFrom: (id, data) =>
        set((state) => {
          const origin = state.transactions.find((t) => t.id === id);
          if (!origin?.recurringGroupId) {
            return withGoals(
              state.goals,
              state.transactions.map((t) =>
                t.id === id ? applySeriesFields(t, data, true) : t
              )
            );
          }
          const transactions = state.transactions.map((t) => {
            if (t.recurringGroupId !== origin.recurringGroupId) return t;
            if (t.date < origin.date) return t;
            return applySeriesFields(t, data, t.id === id);
          });
          return withGoals(state.goals, transactions);
        }),

      deleteTransaction: (id) =>
        set((state) =>
          withGoals(
            state.goals,
            state.transactions.filter((t) => t.id !== id)
          )
        ),

      deleteRecurringGroup: (groupId) =>
        set((state) =>
          withGoals(
            state.goals,
            state.transactions.filter((t) => t.recurringGroupId !== groupId)
          )
        ),

      endSeriesFrom: (id) =>
        set((state) => {
          const origin = state.transactions.find((t) => t.id === id);
          if (!origin?.recurringGroupId) {
            return withGoals(
              state.goals,
              state.transactions.filter((t) => t.id !== id)
            );
          }
          return withGoals(
            state.goals,
            state.transactions.filter((t) => {
              if (t.recurringGroupId !== origin.recurringGroupId) return true;
              return t.date < origin.date;
            })
          );
        }),

      toggleSkip: (id) =>
        set((state) =>
          withGoals(
            state.goals,
            state.transactions.map((t) =>
              t.id === id ? { ...t, skipped: !t.skipped } : t
            )
          )
        ),

      pauseSeriesFrom: (id) =>
        set((state) => {
          const origin = state.transactions.find((t) => t.id === id);
          if (!origin?.recurringGroupId) return state;
          return withGoals(
            state.goals,
            state.transactions.map((t) => {
              if (t.recurringGroupId !== origin.recurringGroupId) return t;
              if (t.date < origin.date) return t;
              return { ...t, seriesPaused: true };
            })
          );
        }),

      resumeSeries: (groupId) =>
        set((state) =>
          withGoals(
            state.goals,
            state.transactions.map((t) =>
              t.recurringGroupId === groupId ? { ...t, seriesPaused: false } : t
            )
          )
        ),

      addCategory: (data) =>
        set((state) => ({
          categories: [...state.categories, { ...data, id: uid("cat") }],
        })),

      updateCategory: (id, data) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          budgets: state.budgets.filter((b) => b.categoryId !== id),
        })),

      addPaymentMethod: (data) =>
        set((state) => ({
          paymentMethods: [...state.paymentMethods, { ...data, id: uid("pm") }],
        })),

      updatePaymentMethod: (id, data) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deletePaymentMethod: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((p) => p.id !== id),
        })),

      addGoal: (data) =>
        set((state) => {
          const opening = data.openingAmount ?? data.savedAmount ?? 0;
          const goal: Goal = {
            ...data,
            openingAmount: opening,
            savedAmount: opening,
            id: uid("goal"),
            createdAt: new Date().toISOString(),
          };
          return { goals: recomputeGoals([...state.goals, goal], state.transactions) };
        }),

      updateGoal: (id, data) =>
        set((state) => ({
          goals: recomputeGoals(
            state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
            state.transactions
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          transactions: state.transactions.map((t) =>
            t.goalId === id ? { ...t, goalId: undefined, goalMovement: undefined } : t
          ),
        })),

      contributeToGoal: (input) =>
        set((state) => {
          const goal = state.goals.find((g) => g.id === input.goalId);
          if (!goal || input.amount <= 0) return state;
          if (input.direction === "withdraw" && input.amount > goal.savedAmount + 0.001) {
            return state;
          }
          const tx: Transaction = {
            id: uid("tx"),
            type: input.direction === "deposit" ? "expense" : "income",
            name:
              input.direction === "deposit"
                ? `Aporte: ${goal.name}`
                : `Resgate: ${goal.name}`,
            amount: roundMoney(input.amount),
            date: input.date,
            categoryId:
              input.direction === "deposit"
                ? GOAL_DEPOSIT_CATEGORY_ID
                : GOAL_WITHDRAW_CATEGORY_ID,
            paymentMethodId: input.paymentMethodId,
            notes: input.notes?.trim() || undefined,
            isRecurring: false,
            goalId: goal.id,
            goalMovement: input.direction,
            createdAt: new Date().toISOString(),
          };
          const transactions = [...state.transactions, tx];
          return {
            categories: withGoalCategories(state.categories),
            transactions,
            goals: recomputeGoals(state.goals, transactions),
          };
        }),

      setBudgets: (items) =>
        set((state) => ({
          budgets: items
            .filter((item) => item.limit > 0)
            .map((item) => {
              const existing = state.budgets.find(
                (b) => b.categoryId === item.categoryId
              );
              return {
                id: existing?.id ?? uid("bud"),
                categoryId: item.categoryId,
                limit: roundMoney(item.limit),
              };
            }),
        })),

      resetAll: () =>
        set({
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          paymentMethods: DEFAULT_PAYMENT_METHODS,
          goals: [],
          budgets: [],
        }),

      replaceAll: (incoming) =>
        set((current) => {
          const transactions = incoming.transactions ?? current.transactions;
          const goals = recomputeGoals(incoming.goals ?? current.goals, transactions);
          return {
            transactions,
            categories:
              incoming.categories && incoming.categories.length
                ? withGoalCategories(incoming.categories)
                : current.categories,
            paymentMethods:
              incoming.paymentMethods && incoming.paymentMethods.length
                ? incoming.paymentMethods
                : current.paymentMethods,
            goals,
            budgets: incoming.budgets ?? current.budgets,
          };
        }),
    }),
    {
      name: "organizae-finance-v1",
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<FinanceState>;
        if (version < 2) {
          state.budgets = state.budgets ?? [];
          state.goals = (state.goals ?? []).map((goal) => ({
            ...goal,
            openingAmount: goal.openingAmount ?? goal.savedAmount ?? 0,
          }));
        }
        return state as FinanceState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        useFinanceStore.setState({
          goals: recomputeGoals(state.goals, state.transactions),
          budgets: state.budgets ?? [],
        });
      },
    }
  )
);
