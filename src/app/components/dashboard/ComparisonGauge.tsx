import { useMemo } from "react";
import { useFootprint } from "../../context/FootprintContext";
import { formatCo2e } from "../../../utils/emissionsMath";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * Radial-style gauge comparing the user's monthly footprint against the
 * regional baseline. Implemented with an SVG arc so it has no chart dependency
 * and announces its value to assistive tech.
 */
export function ComparisonGauge() {
  const { result, baseline } = useFootprint();

  const { ratio, pct } = useMemo(() => {
    const r = baseline.totalMonthlyKg > 0
      ? result.totalMonthlyKg / baseline.totalMonthlyKg
      : 0;
    // Cap the visual sweep at 2x baseline.
    return { ratio: r, pct: Math.min(r / 2, 1) };
  }, [result.totalMonthlyKg, baseline.totalMonthlyKg]);

  const size = 200;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circ = Math.PI * radius; // semicircle
  const offset = circ * (1 - pct);

  const below = ratio <= 1;
  const color = below ? "var(--primary)" : "var(--destructive)";

  return (
    <Card>
      <CardHeader>
        <CardTitle>You vs. Regional Baseline</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-center"
          role="img"
          aria-label={`Your footprint is ${(ratio * 100).toFixed(0)} percent of the regional baseline`}
        >
          <svg
            width={size}
            height={size / 2 + 24}
            viewBox={`0 0 ${size} ${size / 2 + 24}`}
          >
            <path
              d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
            />
            <text
              x={size / 2}
              y={size / 2 - 8}
              textAnchor="middle"
              style={{ fontSize: "1.9rem", fontWeight: 700, fill: color }}
            >
              {(ratio * 100).toFixed(0)}%
            </text>
            <text
              x={size / 2}
              y={size / 2 + 14}
              textAnchor="middle"
              style={{ fontSize: "0.8rem", fill: "var(--muted-foreground)" }}
            >
              of baseline
            </text>
          </svg>
          <div className="mt-2 flex w-full items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">You</span>
              <span className="tabular-nums" style={{ color }}>
                {formatCo2e(result.totalMonthlyKg)}/mo
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Regional avg.</span>
              <span className="tabular-nums">
                {formatCo2e(baseline.totalMonthlyKg)}/mo
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {below
              ? `You're emitting ${formatCo2e(baseline.totalMonthlyKg - result.totalMonthlyKg)} less than the regional average each month. Keep it up!`
              : `You're ${formatCo2e(result.totalMonthlyKg - baseline.totalMonthlyKg)} above the regional average each month.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
