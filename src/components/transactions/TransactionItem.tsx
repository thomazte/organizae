import { Pencil, Trash2, Repeat } from "lucide-react";
import type { Transaction } from "@/types";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  compact = false,
}: {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
  compact?: boolean;
}) {
  const categories = useFinanceStore((s) => s.categories);
  const methods = useFinanceStore((s) => s.paymentMethods);

  const category = categories.find((c) => c.id === transaction.categoryId);
  const method = methods.find((m) => m.id === transaction.paymentMethodId);
  const Icon = getIcon(category?.icon);
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: (category?.color ?? "#94a3b8") + "1a",
          color: category?.color ?? "#94a3b8",
        }}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 grow">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-ink-800 truncate">
            {transaction.name}
          </p>
          {transaction.isRecurring && (
            <Repeat size={13} className="text-ink-300 shrink-0" />
          )}
        </div>
        <p className="text-xs text-ink-400 truncate">
          {category?.name}
          {!compact && method ? ` · ${method.name}` : ""} · {formatDate(transaction.date)}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            isIncome ? "text-brand-600" : "text-ink-800"
          )}
        >
          {isIncome ? "+" : "−"} {formatCurrency(transaction.amount)}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
              aria-label="Editar"
            >
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label="Excluir"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
