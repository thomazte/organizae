import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  hint,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "brand" | "red" | "ink" | "blue" | "violet";
  hint?: string;
  className?: string;
}) {
  const accents: Record<string, { bg: string; text: string }> = {
    brand: { bg: "bg-brand-50", text: "text-brand-600" },
    red: { bg: "bg-red-50", text: "text-red-500" },
    ink: { bg: "bg-ink-100", text: "text-ink-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-500" },
  };
  const a = accents[accent];

  return (
    <div className={cn("card min-w-0 p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center",
            a.bg,
            a.text
          )}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-lg font-bold leading-tight tracking-tight text-ink-900 tabular-nums sm:text-xl xl:text-2xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
