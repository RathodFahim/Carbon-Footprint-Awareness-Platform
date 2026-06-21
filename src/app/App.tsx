import { Leaf, RotateCcw } from "lucide-react";
import { FootprintProvider, useFootprint } from "./context/FootprintContext";
import { formatCo2e } from "../utils/emissionsMath";
import { MetricCards } from "./components/dashboard/MetricCards";
import { ComparisonGauge } from "./components/dashboard/ComparisonGauge";
import { DistributionChart } from "./components/dashboard/DistributionChart";
import { CategoryComparisonChart } from "./components/dashboard/CategoryComparisonChart";
import { Recommendations } from "./components/recommendations/Recommendations";
import { EnergyTracker } from "./components/trackers/EnergyTracker";
import { TransportTracker } from "./components/trackers/TransportTracker";
import { DietTracker } from "./components/trackers/DietTracker";
import { WasteTracker } from "./components/trackers/WasteTracker";
import { Button } from "./components/ui/button";

function Header() {
  const { reset, result } = useFootprint();
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <div className="leading-tight">
            <h1 style={{ fontSize: "1.05rem" }}>Carbon Footprint Tracker</h1>
            <p className="text-xs text-muted-foreground">
              GHG-protocol accurate · India baseline factors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Live region announces real-time totals to screen readers */}
          <p
            className="hidden text-right text-sm text-muted-foreground sm:block"
            aria-live="polite"
            aria-atomic="true"
          >
            Current footprint{" "}
            <span className="text-foreground tabular-nums">
              {formatCo2e(result.totalMonthlyKg)}/mo
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <section aria-label="Key metrics">
          <MetricCards />
        </section>

        {/* Trackers + insights */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section aria-label="Activity trackers" className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2>Your Activity</h2>
              <p className="text-sm text-muted-foreground">
                Drag sliders or type exact values
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <EnergyTracker />
              <TransportTracker />
              <DietTracker />
              <WasteTracker />
            </div>
          </section>

          <section aria-label="Insights" className="space-y-4">
            <h2>Insights</h2>
            <ComparisonGauge />
            <DistributionChart />
          </section>
        </div>

        <section aria-label="Category comparison">
          <CategoryComparisonChart />
        </section>

        <section aria-label="Recommendations">
          <Recommendations />
        </section>

        <footer className="pb-8 pt-2 text-center text-xs text-muted-foreground">
          Estimates use published emission factors (CEA India, IPCC AR5,
          India GHG Program). Figures are indicative, not a certified audit.
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FootprintProvider>
      <Layout />
    </FootprintProvider>
  );
}
