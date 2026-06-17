import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, todayISO } from "@/lib/format";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { Button } from "@/components/ui/Button";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function DatePickerField({
  value,
  onChange,
  title = "Selecionar data",
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => {
    if (!value) return new Date();
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date();
  }, [value]);

  const [viewDate, setViewDate] = useState(selected);

  const openPicker = () => {
    setViewDate(selected);
    setOpen(true);
  };

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { locale: ptBR }),
      end: endOfWeek(monthEnd, { locale: ptBR }),
    });
  }, [viewDate]);

  const monthLabel =
    format(viewDate, "MMMM yyyy", { locale: ptBR }).charAt(0).toUpperCase() +
    format(viewDate, "MMMM yyyy", { locale: ptBR }).slice(1);

  const pickDay = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate(now);
    onChange(todayISO());
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          "input-base flex items-center justify-between gap-2 text-left",
          className
        )}
      >
        <span className="flex items-center gap-2 text-ink-800">
          <Calendar size={16} className="text-ink-400 shrink-0" />
          {value ? formatDate(value) : "Selecionar data"}
        </span>
        <ChevronDown size={16} className="shrink-0 text-ink-400" />
      </button>

      <PickerSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              className="text-sm font-medium text-ink-500 hover:text-ink-700 transition-colors"
            >
              Ir para hoje
            </button>
            <Button size="sm" onClick={goToToday}>
              Hoje
            </Button>
          </div>
        }
      >
        <div className="px-5 py-4 space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 bg-ink-50 border border-ink-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 text-sm font-medium text-ink-700 min-w-[8.5rem] text-center select-none">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((day, i) => (
              <span
                key={`${day}-${i}`}
                className="text-xs font-semibold text-ink-400 py-1"
              >
                {day}
              </span>
            ))}
            {days.map((day) => {
              const selectedDay = isSameDay(day, selected);
              const inMonth = isSameMonth(day, viewDate);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={cn(
                    "h-10 w-full rounded-xl text-sm transition-all duration-150",
                    selectedDay
                      ? "bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30"
                      : today
                        ? "text-brand-600 font-semibold ring-1 ring-brand-500/50 bg-brand-500/10 hover:bg-brand-500/15"
                        : inMonth
                          ? "text-ink-700 hover:bg-ink-100 active:scale-95"
                          : "text-ink-300 hover:bg-ink-50"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      </PickerSheet>
    </>
  );
}
