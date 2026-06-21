import { useState } from "react";
import { Car, ChevronDown } from "lucide-react";
import { useFootprint } from "../../context/FootprintContext";
import type { CarFuel } from "../../../utils/types";
import { LabeledSlider } from "../shared/LabeledSlider";
import { EnumSelect } from "../shared/EnumSelect";
import { TrackerShell } from "./TrackerShell";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

const CAR_OPTIONS: { value: CarFuel; label: string }[] = [
  { value: "petrol", label: "Petrol car" },
  { value: "diesel", label: "Diesel car" },
  { value: "cng", label: "CNG car" },
  { value: "ev", label: "Electric vehicle" },
  { value: "none", label: "No car" },
];

export function TransportTracker() {
  const { profile, updateSection, result } = useFootprint();
  const t = profile.transport;
  const [advanced, setAdvanced] = useState(false);
  const monthly = result.categories.find((c) => c.category === "transport")?.monthlyKg ?? 0;
  const hasCar = t.carFuel !== "none";
  const effUnit = t.carFuel === "ev" ? "km/kWh" : "km/l";

  return (
    <TrackerShell
      icon={<Car className="size-4" />}
      title="Transport"
      monthlyKg={monthly}
    >
      <EnumSelect
        id="car-fuel"
        label="Primary car"
        value={t.carFuel}
        options={CAR_OPTIONS}
        onChange={(v) => updateSection("transport", { carFuel: v as CarFuel })}
      />
      {hasCar ? (
        <>
          <LabeledSlider
            id="car-km"
            label="Car distance"
            value={t.carKmPerWeek}
            min={0}
            max={1000}
            step={5}
            unit="km/wk"
            onChange={(v) => updateSection("transport", { carKmPerWeek: v })}
          />
          <LabeledSlider
            id="car-eff"
            label="Fuel economy"
            value={t.carEfficiency}
            min={2}
            max={40}
            step={0.5}
            unit={effUnit}
            hint="Set this from your real mileage for an accurate fuel estimate."
            onChange={(v) => updateSection("transport", { carEfficiency: v })}
          />
        </>
      ) : null}
      <LabeledSlider
        id="two-wheeler-km"
        label="Two-wheeler distance"
        value={t.twoWheelerKmPerWeek}
        min={0}
        max={1000}
        step={5}
        unit="km/wk"
        onChange={(v) => updateSection("transport", { twoWheelerKmPerWeek: v })}
      />

      <Collapsible open={advanced} onOpenChange={setAdvanced}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
          <span>Public transport & flights</span>
          <ChevronDown
            className={`size-4 transition-transform ${advanced ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-5 pt-5">
          <LabeledSlider
            id="bus-km"
            label="Bus distance"
            value={t.busKmPerWeek}
            min={0}
            max={500}
            step={5}
            unit="km/wk"
            onChange={(v) => updateSection("transport", { busKmPerWeek: v })}
          />
          <LabeledSlider
            id="metro-km"
            label="Metro / rail distance"
            value={t.metroKmPerWeek}
            min={0}
            max={500}
            step={5}
            unit="km/wk"
            onChange={(v) => updateSection("transport", { metroKmPerWeek: v })}
          />
          <LabeledSlider
            id="short-flights"
            label="Short-haul return flights"
            value={t.shortFlightsPerYear}
            min={0}
            max={24}
            step={1}
            unit="/yr"
            onChange={(v) => updateSection("transport", { shortFlightsPerYear: v })}
          />
          <LabeledSlider
            id="long-flights"
            label="Long-haul return flights"
            value={t.longFlightsPerYear}
            min={0}
            max={12}
            step={1}
            unit="/yr"
            onChange={(v) => updateSection("transport", { longFlightsPerYear: v })}
          />
        </CollapsibleContent>
      </Collapsible>
    </TrackerShell>
  );
}
