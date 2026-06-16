import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Preferência do usuário. "system" segue o SO/dispositivo. */
export type ThemePreference = "light" | "dark" | "system";

/** Tema efetivamente aplicado na interface. */
export type ResolvedTheme = "light" | "dark";

interface ThemeStore {
  theme: ThemePreference;
  toggle: () => void;
  setTheme: (theme: ThemePreference) => void;
}

const CYCLE: ThemePreference[] = ["system", "light", "dark"];

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      toggle: () =>
        set((s) => {
          const i = CYCLE.indexOf(s.theme);
          return { theme: CYCLE[(i + 1) % CYCLE.length] };
        }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "organizae-theme",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { theme?: string };
        // Migração v1 → v2: valores antigos permanecem válidos.
        if (
          state.theme === "light" ||
          state.theme === "dark" ||
          state.theme === "system"
        ) {
          return persisted as ThemeStore;
        }
        return { theme: "system" } as ThemeStore;
      },
    }
  )
);

/** Lê a preferência do sistema operacional. */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Converte a preferência do usuário no tema efetivo. */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") return getSystemTheme();
  return preference;
}

/** Aplica a classe .dark no <html> conforme o tema efetivo. */
export function applyThemeClass(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");

  // Atualiza a cor da barra do navegador no mobile.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#0a0f1a" : "#f8fafc");
  }
}

/** Sincroniza DOM + reage a mudanças na preferência do sistema. */
export function initTheme() {
  const sync = () => {
    const pref = useThemeStore.getState().theme;
    applyThemeClass(resolveTheme(pref));
  };

  sync();
  useThemeStore.subscribe(sync);

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (useThemeStore.getState().theme === "system") sync();
  };
  mq.addEventListener("change", onSystemChange);
}

/**
 * Hook que devolve se o tema efetivo é escuro.
 * Re-renderiza quando a preferência do sistema muda (modo automático).
 */
export function useResolvedDark(): boolean {
  const theme = useThemeStore((s) => s.theme);
  const [systemDark, setSystemDark] = useState(
    () => getSystemTheme() === "dark"
  );

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);

  if (theme === "system") return systemDark;
  return theme === "dark";
}
