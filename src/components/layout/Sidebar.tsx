import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AccountButton } from "@/components/account/AccountButton";
import { cn } from "@/lib/cn";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-ink-100 bg-surface">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-ink-100">
        <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
          <Wallet size={20} />
        </div>
        <div className="leading-tight grow">
          <p className="font-bold text-ink-900">Organizaê</p>
          <p className="text-[11px] text-ink-400 -mt-0.5">Planner Financeiro</p>
        </div>
        <ThemeToggle className="-mr-2" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
              )
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-ink-100 space-y-3">
        <AccountButton />
        <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
          <p className="text-sm font-semibold">Dica financeira</p>
          <p className="text-xs text-brand-50/90 mt-1 leading-relaxed">
            Registre seus gastos diariamente. O hábito é o que constrói o
            controle.
          </p>
        </div>
      </div>
    </aside>
  );
}
