import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { uid } from "@/lib/id";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (type, message) =>
    set((s) => ({ toasts: [...s.toasts, { id: uid("toast"), type, message }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Hook simples para disparar feedbacks. */
export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    success: (m: string) => push("success", m),
    error: (m: string) => push("error", m),
    info: (m: string) => push("info", m),
  };
}

const config: Record<ToastType, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: "border-brand-200", iconColor: "text-brand-600" },
  error: { icon: AlertCircle, ring: "border-red-200", iconColor: "text-red-500" },
  info: { icon: Info, ring: "border-blue-200", iconColor: "text-blue-500" },
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const remove = useToastStore((s) => s.remove);
  const { icon: Icon, ring, iconColor } = config[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), 3200);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-surface rounded-xl border shadow-lg px-4 py-3 w-full animate-fade-in",
        ring
      )}
    >
      <Icon size={20} className={cn("shrink-0", iconColor)} />
      <p className="text-sm text-ink-700 grow">{toast.message}</p>
      <button
        onClick={() => remove(toast.id)}
        className="text-ink-300 hover:text-ink-500 transition-colors"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 sm:w-80 pointer-events-none safe-top">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </div>
    </div>
  );
}
