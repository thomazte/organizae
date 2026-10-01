import { useState } from "react";
import { addMonths, setMonth, setYear, startOfMonth, subMonths } from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel } from "@/lib/format";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { Button } from "@/components/ui/Button";
import { MonthYearGrid } from "@/components/shared/MonthYearGrid";

export function MonthSelector({
  date,
  onChange,
}: {
  date: Date;
  onChange: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [year, setViewYear] = useState(date.getFullYear());
  const now = new Date();

  const openPicker = () => {
    setViewYear(date.getFullYear());
    setOpen(true);
  };

  const selectMonth = (monthIndex: number, targetYear = year) => {
    onChange(startOfMonth(setMonth(setYear(date, targetYear), monthIndex)));
    setOpen(false);
  };

  const goToThisMonth = () => {
    onChange(startOfMonth(now));
    setOpen(false);
  };

  return (
    <>
      <div className="inline-flex w-fit self-center shrink-0 items-center gap-1 bg-surface border border-ink-200 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onChange(subMonths(date, 1))}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={openPicker}
          className="px-2 h-8 rounded-lg inline-flex items-center justify-center gap-1 text-sm font-medium text-ink-700 min-w-[8.5rem] hover:bg-ink-100 transition-colors"
          aria-label="Escolher mês e ano"
        >
          {formatMonthLabel(date)}
          <ChevronDown size={14} className="text-ink-400" />
        </button>
        <button
          type="button"
          onClick={() => onChange(addMonths(date, 1))}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <PickerSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Escolher mês"
        footer={
          <div className="flex justify-end">
            <Button size="sm" onClick={goToThisMonth}>
              Este mês
            </Button>
          </div>
        }
      >
        <div className="px-5 py-4">
          <MonthYearGrid
            year={year}
            selectedMonth={date.getMonth()}
            selectedYear={date.getFullYear()}
            currentMonth={now.getMonth()}
            currentYear={now.getFullYear()}
            onYearChange={setViewYear}
            onSelectMonth={selectMonth}
          />
        </div>
      </PickerSheet>
    </>
  );
}
