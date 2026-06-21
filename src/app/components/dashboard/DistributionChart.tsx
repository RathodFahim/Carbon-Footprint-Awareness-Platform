import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useFootprint } from "../../context/FootprintContext";
import { formatCo2e } from "../../../utils/emissionsMath";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DistributionChart() {
  const { result } = useFootprint();

  const data = useMemo(
    () =>
      result.categories
        .map((c) => ({ name: c.label, value: Math.max(0, c.monthlyKg) }))
        .filter((d) => d.value > 0),
    [result.categories],
  );

  const total = result.totalMonthlyKg;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emissions by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No emissions recorded yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                stroke="var(--background)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${formatCo2e(value)} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                  "Monthly",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: "var(--foreground)", fontSize: 13 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
