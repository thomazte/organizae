import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./nav";
import { cn } from "@/lib/cn";

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-ink-100 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-brand-600" : "text-ink-400"
              )
            }
          >
            <item.icon size={21} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
