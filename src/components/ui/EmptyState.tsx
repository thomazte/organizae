import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="h-14 w-14 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center">
        <Icon size={26} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-700">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
