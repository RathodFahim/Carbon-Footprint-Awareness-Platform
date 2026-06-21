import { useMemo, type ReactNode } from "react";
import { Lightbulb, Sparkles, Repeat, Rocket } from "lucide-react";
import { useFootprint } from "../../context/FootprintContext";
import { TIER_META } from "../../../utils/recommendations";
import { formatCo2e } from "../../../utils/emissionsMath";
import type { EffortTier, Recommendation } from "../../../utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const TIER_ORDER: EffortTier[] = ["quick-win", "habit-shift", "major-move"];

const TIER_ICON: Record<EffortTier, ReactNode> = {
  "quick-win": <Sparkles className="size-4" />,
  "habit-shift": <Repeat className="size-4" />,
  "major-move": <Rocket className="size-4" />,
};

function RecCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p style={{ fontWeight: 500 }}>{rec.title}</p>
        <Badge className="shrink-0 tabular-nums bg-primary/10 text-primary border-0">
          −{formatCo2e(rec.monthlySavingKg)}/mo
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{rec.detail}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Saves {formatCo2e(rec.monthlySavingKg * 12)} per year vs. your current habits.
      </p>
    </div>
  );
}

export function Recommendations() {
  const { recommendations } = useFootprint();

  const grouped = useMemo(() => {
    const map: Record<EffortTier, Recommendation[]> = {
      "quick-win": [],
      "habit-shift": [],
      "major-move": [],
    };
    for (const r of recommendations) map[r.tier].push(r);
    return map;
  }, [recommendations]);

  const totalPotential = useMemo(
    () => recommendations.reduce((acc, r) => acc + r.monthlySavingKg, 0),
    [recommendations],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
            <Lightbulb className="size-4" />
          </span>
          Personalized Actions
        </CardTitle>
        <Badge variant="secondary" className="tabular-nums">
          up to −{formatCo2e(totalPotential)}/mo
        </Badge>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You're already running a remarkably low-carbon lifestyle — no
            high-impact actions left to suggest.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {TIER_ORDER.map((tier) => (
              <div key={tier} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-md bg-secondary text-secondary-foreground">
                    {TIER_ICON[tier]}
                  </span>
                  <div className="leading-tight">
                    <p style={{ fontWeight: 500 }}>{TIER_META[tier].label}</p>
                    <p className="text-xs text-muted-foreground">
                      {TIER_META[tier].description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {grouped[tier].length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                      No actions in this tier right now.
                    </p>
                  ) : (
                    grouped[tier].map((rec) => <RecCard key={rec.id} rec={rec} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
