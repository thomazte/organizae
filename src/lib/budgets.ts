import { endOfMonth, startOfMonth } from "date-fns";
import type { Category, CategoryBudget, Transaction } from "@/types";
import { filterByInterval, sumTotals } from "@/lib/analytics";
import { roundMoney } from "@/lib/money";

export interface BudgetStatus {
  budget: CategoryBudget;
  category: Category | undefined;
  spent: number;
  limit: number;
  /** Percentual gasto (pode passar de 100). */
  percent: number;
  remaining: number;
  over: boolean;
}

/** Quanto cada orçamento consumiu no mês de referência. */
export function budgetStatuses(
  budgets: CategoryBudget[],
  transactions: Transaction[],
  categories: Category[],
  reference = new Date()
): BudgetStatus[] {
  const monthTx = filterByInterval(
    transactions,
    startOfMonth(reference),
    endOfMonth(reference)
  );

  return budgets
    .filter((b) => b.limit > 0)
    .map((budget) => {
      const spent = sumTotals(
        monthTx.filter(
          (t) => t.type === "expense" && t.categoryId === budget.categoryId
        )
      ).expense;
      const limit = budget.limit;
      const remaining = roundMoney(limit - spent);
      return {
        budget,
        category: categories.find((c) => c.id === budget.categoryId),
        spent,
        limit,
        percent: limit > 0 ? (spent / limit) * 100 : 0,
        remaining,
        over: spent > limit,
      };
    })
    .sort((a, b) => b.percent - a.percent);
}
