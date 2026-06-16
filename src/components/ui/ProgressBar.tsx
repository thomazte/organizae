import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  color = "#3b82f6",
  className,
  trackClassName,
}: {
  /** Percentual de 0 a 100. */
  value: number;
  color?: string;
  className?: string;
  trackClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2.5 w-full rounded-full bg-ink-100 overflow-hidden",
        trackClassName
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", className)}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
