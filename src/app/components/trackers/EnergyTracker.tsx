import { Zap } from "lucide-react";
import { useFootprint } from "../../context/FootprintContext";
import { COOKING_FUELS } from "../../../utils/emissionFactors";
import type { CookingFuel } from "../../../utils/types";
import { LabeledSlider } from "../shared/LabeledSlider";
import { EnumSelect } from "../shared/EnumSelect";
import { TrackerShell } from "./TrackerShell";

const COOKING_OPTIONS: { value: CookingFuel; label: string }[] = [
  { value: "lpg", label: "LPG cylinder" },
  { value: "png", label: "Piped natural gas" },
  { value: "electric", label: "Electric stove" },
  { value: "induction", label: "Induction" },
];

const COOKING_UNIT: Record<CookingFuel, string> = {
  lpg: "kg",
  png: "scm",
  electric: "kWh",
  induction: "kWh",
};

export function EnergyTracker() {
  const { profile, updateSection, result } = useFootprint();
  const energy = profile.energy;
  const monthly = result.categories.find((c) => c.category === "energy")?.monthlyKg ?? 0;

  return (
    <TrackerShell
      icon={<Zap className="size-4" />}
      title="Home Energy"
      monthlyKg={monthly}
    >
      <LabeledSlider
        id="electricity"
        label="Monthly electricity"
        value={energy.electricityKwh}
        min={0}
        max={1500}
        step={5}
        unit="kWh"
        hint="Read the total kWh from your latest electricity bill for accuracy."
        onChange={(v) => updateSection("energy", { electricityKwh: v })}
      />
      <LabeledSlider
        id="renewable"
        label="Solar / renewable share"
        value={energy.renewableShare}
        min={0}
        max={1}
        percent
        hint="At 100% the grid emission factor is overridden to zero (no double counting)."
        onChange={(v) => updateSection("energy", { renewableShare: v })}
      />
      <EnumSelect
        id="cooking-fuel"
        label="Cooking fuel"
        value={energy.cookingFuel}
        options={COOKING_OPTIONS}
        onChange={(v) =>
          updateSection("energy", { cookingFuel: v as CookingFuel })
        }
      />
      <LabeledSlider
        id="cooking-amount"
        label={`Monthly ${COOKING_FUELS[energy.cookingFuel].label.toLowerCase()}`}
        value={energy.cookingAmount}
        min={0}
        max={200}
        step={0.5}
        unit={COOKING_UNIT[energy.cookingFuel]}
        onChange={(v) => updateSection("energy", { cookingAmount: v })}
      />
    </TrackerShell>
  );
}
