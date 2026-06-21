import { useMemo } from "react";
import { useFootprint } from "../../context/FootprintContext";
import { formatCo2e } from "../../../utils/emissionsMath";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Row {
  key: string;
  name: string;
  you: number;
  baseline: number;
}

/**
 * Pure CSS/SVG grouped bar chart — avoids the recharts internal duplicate-key
 * warning entirely while giving us full control over rendering and keys.
 */
export function CategoryComparisonChart() {
  const { result, baseline } = useFootprint();

  const rows = useMemo<Row[]>(
    () =>
      result.categories.map((c) => ({
        key: c.category,
        name: c.label,
        you: Math.max(0, c.monthlyKg),
        baseline: Math.max(
          0,
          baseline.categories.find((b) => b.category === c.category)?.monthlyKg ?? 0,
        ),
      })),
    [result.categories, baseline.categories],
  );

  const max = useMemo(
    () => Math.max(1, ...rows.flatMap((r) => [r.you, r.baseline])),
    [rows],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>You vs. Baseline by Category</CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-[var(--chart-1)]" />
            You
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-muted-foreground" />
            Baseline
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-around gap-4" style={{ height: 240 }}>
          {rows.map((row) => {
            const youPct = (row.you / max) * 100;
            const basePct = (row.baseline / max) * 100;
            return (
              <div
                key={row.key}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end justify-center gap-1.5">
                  <div
                    className="group relative flex w-1/2 max-w-10 items-end justify-center rounded-t-md bg-[var(--chart-1)] transition-[height] duration-300"
                    style={{ height: `${youPct}%` }}
                    title={`You: ${formatCo2e(row.you)}/mo`}
                  >
                    <span className="absolute -top-5 text-xs tabular-nums text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {formatCo2e(row.you)}
                    </span>
                  </div>
                  <div
                    className="group relative flex w-1/2 max-w-10 items-end justify-center rounded-t-md bg-muted-foreground/70 transition-[height] duration-300"
                    style={{ height: `${basePct}%` }}
                    title={`Baseline: ${formatCo2e(row.baseline)}/mo`}
                  >
                    <span className="absolute -top-5 text-xs tabular-nums text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {formatCo2e(row.baseline)}
                    </span>
                  </div>
                </div>
                <span className="text-center text-xs text-muted-foreground">
                  {row.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
