import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function MonthYearGrid({
  year,
  selectedMonth,
  selectedYear,
  currentMonth,
  currentYear,
  onYearChange,
  onSelectMonth,
}: {
  year: number;
  /** Mês selecionado, de 0 a 11. */
  selectedMonth: number;
  selectedYear: number;
  currentMonth: number;
  currentYear: number;
  onYearChange: (year: number) => void;
  onSelectMonth: (monthIndex: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onYearChange(year - 1)}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
          aria-label="Ano anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-semibold text-ink-900 tabular-nums">{year}</span>
        <button
          type="button"
          onClick={() => onYearChange(year + 1)}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
          aria-label="Próximo ano"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((label, index) => {
          const selected = selectedYear === year && selectedMonth === index;
          const current = currentYear === year && currentMonth === index;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelectMonth(index)}
              className={cn(
                "h-12 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                selected
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : current
                    ? "text-brand-600 ring-1 ring-brand-500/50 bg-brand-500/10 hover:bg-brand-500/15"
                    : "text-ink-700 hover:bg-ink-100"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
