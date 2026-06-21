import { CalendarDays, CloudSun, TrendingDown, TrendingUp } from "lucide-react";
import { useFootprint } from "../../context/FootprintContext";
import { formatCo2e } from "../../../utils/emissionsMath";
import { Card, CardContent } from "../ui/card";

export function MetricCards() {
  const { result, baseline } = useFootprint();

  const deltaPct =
    baseline.totalMonthlyKg > 0
      ? ((result.totalMonthlyKg - baseline.totalMonthlyKg) / baseline.totalMonthlyKg) * 100
      : 0;
  const below = deltaPct <= 0;

  const annualTonnes = (result.totalMonthlyKg * 12) / 1000;

  const metrics = [
    {
      id: "daily",
      label: "Daily footprint",
      value: formatCo2e(result.totalDailyKg),
      icon: <CalendarDays className="size-5" />,
      sub: "kg CO₂e per day",
    },
    {
      id: "monthly",
      label: "Monthly footprint",
      value: formatCo2e(result.totalMonthlyKg),
      icon: <CloudSun className="size-5" />,
      sub: "kg CO₂e per month",
    },
    {
      id: "annual",
      label: "Annualized",
      value: `${annualTonnes.toFixed(2)} t`,
      icon: <CalendarDays className="size-5" />,
      sub: "tonnes CO₂e per year",
    },
    {
      id: "vs-baseline",
      label: "vs. regional average",
      value: `${below ? "" : "+"}${deltaPct.toFixed(0)}%`,
      icon: below ? (
        <TrendingDown className="size-5" />
      ) : (
        <TrendingUp className="size-5" />
      ),
      sub: below ? "below baseline" : "above baseline",
      tone: below ? "good" : "bad",
    },
  ] as const;

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {metrics.map((m) => (
        <Card key={m.id}>
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">{m.label}</span>
              <span
                className={
                  "tone" in m && m.tone === "good"
                    ? "text-primary"
                    : "tone" in m && m.tone === "bad"
                      ? "text-destructive"
                      : "text-primary"
                }
              >
                {m.icon}
              </span>
            </div>
            <div
              className={`tabular-nums ${
                "tone" in m && m.tone === "good"
                  ? "text-primary"
                  : "tone" in m && m.tone === "bad"
                    ? "text-destructive"
                    : ""
              }`}
              style={{ fontSize: "1.6rem", fontWeight: 600, lineHeight: 1.1 }}
            >
              {m.value}
            </div>
            <span className="text-xs text-muted-foreground">{m.sub}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
