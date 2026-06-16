import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { PickerSheet } from "@/components/ui/PickerSheet";

export interface PickerOption {
  value: string;
  label: string;
}

export function OptionPicker({
  value,
  onChange,
  options,
  title,
  placeholder = "Selecionar",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  title: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "input-base flex items-center justify-between gap-2 text-left transition-colors",
          open && "border-brand-500 ring-2 ring-brand-500/20",
          className
        )}
      >
        <span className={cn(selected ? "text-ink-800" : "text-ink-400")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-ink-400 transition-transform duration-200",
            open && "rotate-180 text-brand-500"
          )}
        />
      </button>

      <PickerSheet open={open} onClose={() => setOpen(false)} title={title}>
        <ul className="py-1 pb-2">
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-5 py-3.5 text-sm transition-all duration-150",
                    isSelected
                      ? "bg-brand-500/10 text-brand-600 font-medium"
                      : "text-ink-700 hover:bg-ink-50 active:bg-ink-100",
                    index < options.length - 1 && "border-b border-ink-100/80"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={18} className="shrink-0 text-brand-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PickerSheet>
    </>
  );
}
