import type { CSSProperties } from "react";
import { useResolvedDark } from "@/store/useTheme";

interface ChartTheme {
  grid: string;
  tick: string;
  label: string;
  tooltip: CSSProperties;
}

/** Cores dos gráficos que se adaptam ao tema claro/escuro. */
export function useChartTheme(): ChartTheme {
  const isDark = useResolvedDark();

  return {
    grid: isDark ? "#1f2a3d" : "#f1f5f9",
    tick: isDark ? "#8b97a9" : "#94a3b8",
    label: isDark ? "#f9fafb" : "#0f172a",
    tooltip: {
      borderRadius: 12,
      border: `1px solid ${isDark ? "#29354a" : "#e2e8f0"}`,
      backgroundColor: isDark ? "#121a27" : "#ffffff",
      color: isDark ? "#eef1f6" : "#0f172a",
      boxShadow: "0 8px 24px rgba(2,8,20,0.18)",
      fontSize: 13,
    },
  };
}
