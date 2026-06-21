import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFootprint } from "../../context/FootprintContext";
import { formatCo2e } from "../../../utils/emissionsMath";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function CategoryComparisonChart() {
  const { result, baseline } = useFootprint();

  const data = useMemo(
    () =>
      result.categories.map((c) => {
        const base =
          baseline.categories.find((b) => b.category === c.category)?.monthlyKg ?? 0;
        return {
          name: c.label,
          You: Math.max(0, Number(c.monthlyKg.toFixed(1))),
          Baseline: Math.max(0, Number(base.toFixed(1))),
        };
      }),
    [result.categories, baseline.categories],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>You vs. Baseline by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value: number) => formatCo2e(value)}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--foreground)", fontSize: 13 }}>{value}</span>
              )}
            />
            <Bar dataKey="You" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Baseline" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
