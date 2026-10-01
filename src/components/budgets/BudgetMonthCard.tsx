import { Link } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFinanceStore } from "@/store/useFinanceStore";
import { budgetStatuses } from "@/lib/budgets";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { useMemo } from "react";

export function BudgetMonthCard({ month }: { month: Date }) {
  const budgets = useFinanceStore((s) => s.budgets);
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);

  const statuses = useMemo(
    () => budgetStatuses(budgets, transactions, categories, month),
    [budgets, transactions, categories, month]
  );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1 gap-3">
        <div className="flex items-center gap-2">
          <PiggyBank size={18} className="text-brand-600" />
          <h3 className="font-semibold text-ink-900">Orçamentos do mês</h3>
        </div>
        <Link
          to="/configuracoes?aba=orcamentos"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0"
        >
          {statuses.length ? "Ajustar" : "Definir limites"}
        </Link>
      </div>
      <p className="text-xs text-ink-400 mb-4">{formatMonthLabel(month)}</p>

      {statuses.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-3">
          Defina um teto mensal por categoria para acompanhar o quanto ainda pode gastar.
        </p>
      ) : (
        <div className="space-y-4">
          {statuses.map((status) => {
            const color = status.over
              ? "#ef4444"
              : (status.category?.color ?? "#3b82f6");
            return (
              <div key={status.budget.id}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <p className="text-sm font-medium text-ink-800 truncate">
                    {status.category?.name ?? "Categoria removida"}
                  </p>
                  <p className="text-xs text-ink-500 tabular-nums shrink-0">
                    {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                  </p>
                </div>
                <ProgressBar value={status.percent} color={color} />
                <p
                  className={`mt-1 text-xs ${
                    status.over ? "text-red-500" : "text-ink-400"
                  }`}
                >
                  {status.over
                    ? `${formatCurrency(Math.abs(status.remaining))} acima do limite`
                    : `${formatCurrency(status.remaining)} restante`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
