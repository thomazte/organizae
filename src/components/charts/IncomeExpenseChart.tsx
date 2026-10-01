import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySeriesPoint } from "@/lib/analytics";
import { formatCurrency, formatCurrencyShort } from "@/lib/format";
import { useChartTheme } from "./useChartTheme";

function BalanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlySeriesPoint }>;
}) {
  const point = payload?.[0]?.payload;
  const theme = useChartTheme();
  if (!active || !point) return null;

  const rows = [
    ["Receitas", point.income],
    ["Despesas", point.expense],
    ["Saldo do mês", point.balance],
    ["Saldo acumulado", point.cumulative],
  ] as const;

  return (
    <div style={theme.tooltip} className="px-3 py-2">
      <p style={{ color: theme.label, fontWeight: 600, marginBottom: 4 }}>
        {point.label}
      </p>
      {rows.map(([label, value]) => (
        <p key={label} className="text-[13px] tabular-nums">
          {label}: {formatCurrency(value)}
        </p>
      ))}
    </div>
  );
}

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
          yAxisId="month"
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: t.tick, fontSize: 11 }}
          tickFormatter={(v) => formatCurrencyShort(Number(v))}
        />
        <YAxis
          yAxisId="cumulative"
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: t.tick, fontSize: 11 }}
          tickFormatter={(v) => formatCurrencyShort(Number(v))}
        />
        <Tooltip content={<BalanceTooltip />} />
        <Area
          yAxisId="month"
          type="monotone"
          dataKey="income"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#gIncome)"
        />
        <Area
          yAxisId="month"
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#gExpense)"
        />
        <Line
          yAxisId="cumulative"
          type="monotone"
          dataKey="cumulative"
          stroke="#7c3aed"
          strokeWidth={2.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
