import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getIcon } from "@/lib/icons";

export function BudgetsTab() {
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const setBudgets = useFinanceStore((s) => s.setBudgets);
  const toast = useToast();

  const expense = categories.filter((c) => c.type === "expense");
  const [limits, setLimits] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    for (const category of expense) {
      next[category.id] =
        budgets.find((b) => b.categoryId === category.id)?.limit ?? 0;
    }
    setLimits(next);
  }, [budgets, categories]);

  const save = () => {
    setBudgets(
      expense.map((category) => ({
        categoryId: category.id,
        limit: limits[category.id] ?? 0,
      }))
    );
    toast.success("Orçamentos salvos.");
  };

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-ink-900">Limite mensal</h3>
        <p className="text-sm text-ink-400">
          O teto vale todo mês. Deixe em zero para não acompanhar a categoria.
        </p>
      </div>

      <div className="space-y-3">
        {expense.map((category) => {
          const Icon = getIcon(category.icon);
          return (
            <div
              key={category.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2 sm:items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: category.color + "1a",
                    color: category.color,
                  }}
                >
                  <Icon size={17} />
                </div>
                <span className="text-sm font-medium text-ink-700 truncate">
                  {category.name}
                </span>
              </div>
              <CurrencyInput
                value={limits[category.id] ?? 0}
                onChange={(value) =>
                  setLimits((current) => ({ ...current, [category.id]: value }))
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={save}>Salvar orçamentos</Button>
      </div>
    </div>
  );
}
