import { describe, expect, it } from "vitest";
import type { CategoryBudget, Goal, Transaction } from "@/types";
import { sumTotals, monthlySeries } from "@/lib/analytics";
import { budgetStatuses } from "@/lib/budgets";
import { movementNet, recomputeGoals } from "@/lib/goals";
import { notificationIdFor, planReminders, reminderInstant } from "@/lib/reminders";

function tx(partial: Partial<Transaction> & Pick<Transaction, "id" | "date" | "amount" | "type">): Transaction {
  return {
    name: partial.name ?? "Item",
    categoryId: partial.categoryId ?? "cat_alimentacao",
    paymentMethodId: partial.paymentMethodId ?? "pm_pix_out",
    isRecurring: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("saldos mensais", () => {
  it("soma o saldo acumulado incluindo meses anteriores à janela", () => {
    const transactions = [
      tx({ id: "jan", date: "2026-01-15", type: "income", amount: 100 }),
      tx({ id: "ago", date: "2026-08-10", type: "income", amount: 50 }),
      tx({ id: "set", date: "2026-09-10", type: "expense", amount: 20 }),
    ];

    const series = monthlySeries(transactions, 2, new Date(2026, 8, 15));

    expect(series).toHaveLength(2);
    expect(series[0].balance).toBe(50);
    expect(series[0].cumulative).toBe(150);
    expect(series[1].balance).toBe(-20);
    expect(series[1].cumulative).toBe(130);
  });

  it("ignora lançamentos pulados e pausados", () => {
    const totals = sumTotals([
      tx({ id: "a", date: "2026-09-01", type: "expense", amount: 40 }),
      tx({ id: "b", date: "2026-09-02", type: "expense", amount: 10, skipped: true }),
      tx({ id: "c", date: "2026-09-03", type: "income", amount: 25, seriesPaused: true }),
    ]);
    expect(totals).toEqual({ income: 0, expense: 40, balance: -40 });
  });
});

describe("orçamentos", () => {
  it("marca a categoria que passou do limite no mês", () => {
    const budgets: CategoryBudget[] = [
      { id: "b1", categoryId: "cat_alimentacao", limit: 100 },
    ];
    const transactions = [
      tx({ id: "a", date: "2026-09-02", type: "expense", amount: 80, categoryId: "cat_alimentacao" }),
      tx({ id: "b", date: "2026-09-18", type: "expense", amount: 30, categoryId: "cat_alimentacao" }),
      tx({ id: "c", date: "2026-08-18", type: "expense", amount: 500, categoryId: "cat_alimentacao" }),
      tx({ id: "d", date: "2026-09-05", type: "expense", amount: 40, categoryId: "cat_alimentacao", skipped: true }),
    ];

    const [status] = budgetStatuses(budgets, transactions, [], new Date(2026, 8, 20));
    expect(status.spent).toBe(110);
    expect(status.over).toBe(true);
    expect(status.remaining).toBe(-10);
  });
});

describe("metas no caixa", () => {
  const goal: Goal = {
    id: "goal_1",
    name: "Viagem",
    targetAmount: 1000,
    savedAmount: 200,
    openingAmount: 200,
    deadline: "2026-12-01",
    startDate: "2026-01-01",
    color: "#3b82f6",
    icon: "Target",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  it("soma aporte e desconta resgate só quando contam no caixa", () => {
    const transactions = [
      tx({
        id: "dep",
        date: "2026-09-01",
        type: "expense",
        amount: 150,
        goalId: "goal_1",
        goalMovement: "deposit",
      }),
      tx({
        id: "wd",
        date: "2026-09-02",
        type: "income",
        amount: 40,
        goalId: "goal_1",
        goalMovement: "withdraw",
      }),
      tx({
        id: "skip",
        date: "2026-09-03",
        type: "expense",
        amount: 999,
        goalId: "goal_1",
        goalMovement: "deposit",
        skipped: true,
      }),
    ];

    expect(movementNet("goal_1", transactions)).toBe(110);
    const [next] = recomputeGoals([goal], transactions);
    expect(next.savedAmount).toBe(310);
    expect(next.openingAmount).toBe(200);
  });
});

describe("lembretes", () => {
  it("gera um id estável", () => {
    expect(notificationIdFor("tx_aluguel")).toBe(notificationIdFor("tx_aluguel"));
  });

  it("avisa às 9h da véspera, ou às 9h do dia se a véspera já passou", () => {
    const now = new Date(2026, 9, 1, 15, 0, 0);
    const tomorrow = reminderInstant("2026-10-02", now);
    expect(tomorrow?.getHours()).toBe(9);
    expect(tomorrow?.getDate()).toBe(2);

    const later = reminderInstant("2026-10-05", now);
    expect(later?.getDate()).toBe(4);
    expect(later?.getHours()).toBe(9);

    const today = reminderInstant("2026-10-01", now);
    expect(today).toBeNull();
  });

  it("não lembra lançamento pulado", () => {
    const now = new Date(2026, 9, 1, 8, 0, 0);
    const plans = planReminders(
      [
        tx({ id: "ok", date: "2026-10-03", type: "expense", amount: 80, name: "Luz" }),
        tx({ id: "skip", date: "2026-10-03", type: "expense", amount: 10, skipped: true }),
      ],
      now
    );
    expect(plans.map((p) => p.transactionId)).toEqual(["ok"]);
    expect(plans[0].title).toBe("Pagamento amanhã");
    expect(plans[0].body).toContain("Luz");
  });
});
