import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  Goal,
  PaymentMethod,
  RecurrenceFrequency,
  Transaction,
} from "@/types";
import type { FinanceState } from "@/types";
import { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from "@/lib/defaults";
import { uid } from "@/lib/id";
import { generateRecurringTransactions } from "@/lib/recurrence";

type NewTransaction = Omit<Transaction, "id" | "createdAt" | "recurringGroupId">;

interface FinanceStore {
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  goals: Goal[];
  /** Dinheiro que já existia antes do primeiro lançamento. */
  openingBalance: number;

  // Transações
  addTransaction: (data: NewTransaction, until?: Date) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteRecurringGroup: (groupId: string) => void;

  // Categorias
  addCategory: (data: Omit<Category, "id">) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Formas de pagamento/recebimento
  addPaymentMethod: (data: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;

  // Metas
  addGoal: (data: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;

  // Utilidades
  setOpeningBalance: (amount: number) => void;
  resetAll: () => void;
  /** Substitui todo o estado (usado pela sincronização e importação). */
  replaceAll: (state: Partial<FinanceState>) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      goals: [],
      openingBalance: 0,

      addTransaction: (data, until) =>
        set((state) => {
          if (data.isRecurring && data.recurrence && until) {
            const generated = generateRecurringTransactions(
              data,
              data.recurrence as RecurrenceFrequency,
              until
            );
            return { transactions: [...state.transactions, ...generated] };
          }
          const tx: Transaction = {
            ...data,
            id: uid("tx"),
            createdAt: new Date().toISOString(),
          };
          return { transactions: [...state.transactions, tx] };
        }),

      updateTransaction: (id, data) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      deleteRecurringGroup: (groupId) =>
        set((state) => ({
          transactions: state.transactions.filter(
            (t) => t.recurringGroupId !== groupId
          ),
        })),

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
        set((state) => ({
          goals: [
            ...state.goals,
            { ...data, id: uid("goal"), createdAt: new Date().toISOString() },
          ],
        })),

      updateGoal: (id, data) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      addToGoal: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, savedAmount: Math.max(g.savedAmount + amount, 0) }
              : g
          ),
        })),

      setOpeningBalance: (amount) =>
        set((state) =>
          state.openingBalance === amount ? state : { openingBalance: amount }
        ),

      resetAll: () =>
        set({
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          paymentMethods: DEFAULT_PAYMENT_METHODS,
          goals: [],
          openingBalance: 0,
        }),

      replaceAll: (state) =>
        set((current) => ({
          transactions: state.transactions ?? current.transactions,
          categories:
            state.categories && state.categories.length
              ? state.categories
              : current.categories,
          paymentMethods:
            state.paymentMethods && state.paymentMethods.length
              ? state.paymentMethods
              : current.paymentMethods,
          goals: state.goals ?? current.goals,
          openingBalance:
            typeof state.openingBalance === "number"
              ? state.openingBalance
              : current.openingBalance,
        })),
    }),
    {
      name: "organizae-finance-v1",
      version: 1,
    }
  )
);
