import { Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AccountIconButton } from "@/components/account/AccountButton";

export function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-ink-50/80 backdrop-blur-md border-b border-ink-100 safe-top">
      {/* Marca visível apenas no mobile (sidebar cobre no desktop) */}
      <div className="lg:hidden flex items-center gap-2.5 px-4 sm:px-6 min-h-14 border-b border-ink-100">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
          <Wallet size={18} />
        </div>
        <p className="font-bold text-ink-900 grow">Organizaê</p>
        <AccountIconButton />
        <ThemeToggle className="-mr-1" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
