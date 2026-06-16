import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Category, Transaction } from "@/types";

export interface PeriodTotals {
  income: number;
  expense: number;
  balance: number;
}

/** Soma receitas/despesas de uma lista de transações. */
export function sumTotals(transactions: Transaction[]): PeriodTotals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

/** Filtra transações dentro de um intervalo (inclusive). */
export function filterByInterval(
  transactions: Transaction[],
  start: Date,
  end: Date
): Transaction[] {
  return transactions.filter((t) => {
    const d = parseISO(t.date);
    return isWithinInterval(d, { start, end });
  });
}

/** Saldo total acumulado (todas as transações). */
export function totalBalance(transactions: Transaction[]): number {
  return sumTotals(transactions).balance;
}

export interface CategoryBreakdown {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  percent: number;
}

/** Agrupa transações por categoria, ordenado do maior para o menor. */
export function breakdownByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdown[] {
  const map = new Map<string, number>();
  let grandTotal = 0;
  for (const t of transactions) {
    map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    grandTotal += t.amount;
  }

  const result: CategoryBreakdown[] = [];
  for (const [categoryId, total] of map.entries()) {
    const cat = categories.find((c) => c.id === categoryId);
    result.push({
      categoryId,
      name: cat?.name ?? "Sem categoria",
      color: cat?.color ?? "#94a3b8",
      icon: cat?.icon ?? "Wallet",
      total,
      percent: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    });
  }
  return result.sort((a, b) => b.total - a.total);
}

export interface MonthlySeriesPoint {
  label: string;
  monthKey: string;
  income: number;
  expense: number;
}

/** Série dos últimos N meses para o gráfico de entradas x saídas. */
export function monthlySeries(
  transactions: Transaction[],
  months = 6,
  reference = new Date()
): MonthlySeriesPoint[] {
  const points: MonthlySeriesPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(reference, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const inMonth = filterByInterval(transactions, start, end);
    const totals = sumTotals(inMonth);
    points.push({
      label: format(monthDate, "MMM", { locale: ptBR }),
      monthKey: format(monthDate, "yyyy-MM"),
      income: totals.income,
      expense: totals.expense,
    });
  }
  return points;
}

/** Próximos lançamentos a partir de uma data (ordenado por data crescente). */
export function upcoming(
  transactions: Transaction[],
  type: "income" | "expense",
  fromISO: string,
  limit = 5
): Transaction[] {
  return transactions
    .filter((t) => t.type === type && t.date >= fromISO)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
