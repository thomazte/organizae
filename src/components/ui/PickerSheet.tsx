import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function PickerSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-md bg-surface rounded-t-3xl shadow-2xl animate-slide-up-sheet",
          "max-h-[min(82vh,640px)] flex flex-col",
          className
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-ink-200" aria-hidden />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 pb-3 border-b border-ink-100">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-ink-100 bg-ink-50/50 px-5 py-3 safe-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
