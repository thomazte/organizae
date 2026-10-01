import { cn } from "@/lib/cn";

interface Segment<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: Segment<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap max-w-full bg-ink-100 rounded-xl p-1 gap-1",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-surface dark:bg-ink-300 text-ink-900 shadow-sm"
              : "text-ink-500 hover:text-ink-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
