import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryBreakdown } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { useChartTheme } from "./useChartTheme";

export function CategoryDonut({ data }: { data: CategoryBreakdown[] }) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name) => [formatCurrency(value), name]}
          contentStyle={t.tooltip}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
