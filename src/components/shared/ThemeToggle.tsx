import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeStore, type ThemePreference } from "@/store/useTheme";
import { cn } from "@/lib/cn";

const LABELS: Record<ThemePreference, string> = {
  system: "Automático (segue o sistema)",
  light: "Modo claro",
  dark: "Modo escuro",
};

/** Botão compacto: alterna entre Automático → Claro → Escuro. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  const Icon =
    theme === "system" ? Monitor : theme === "dark" ? Sun : Moon;

  return (
    <button
      onClick={toggle}
      className={cn(
        "h-9 w-9 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors",
        className
      )}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
    >
      <Icon size={19} />
    </button>
  );
}
