import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySeriesPoint } from "@/lib/analytics";
import { formatCurrency, formatCurrencyShort } from "@/lib/format";
import { useChartTheme } from "./useChartTheme";

export function IncomeExpenseChart({ data }: { data: MonthlySeriesPoint[] }) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: t.tick, fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: t.tick, fontSize: 11 }}
          tickFormatter={(v) => formatCurrencyShort(Number(v))}
        />
        <Tooltip
          formatter={(value: number, name) => [
            formatCurrency(value),
            name === "income" ? "Receitas" : "Despesas",
          ]}
          labelStyle={{ color: t.label, fontWeight: 600 }}
          contentStyle={t.tooltip}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#gIncome)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#gExpense)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
