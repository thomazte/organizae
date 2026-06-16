import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel } from "@/lib/format";

export function MonthSelector({
  date,
  onChange,
}: {
  date: Date;
  onChange: (date: Date) => void;
}) {
  return (
    <div className="inline-flex w-fit self-center shrink-0 items-center gap-1 bg-surface border border-ink-200 rounded-xl p-1">
      <button
        onClick={() => onChange(subMonths(date, 1))}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="px-2 text-sm font-medium text-ink-700 min-w-[8.5rem] text-center select-none">
        {formatMonthLabel(date)}
      </span>
      <button
        onClick={() => onChange(addMonths(date, 1))}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
