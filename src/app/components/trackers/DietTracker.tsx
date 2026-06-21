import { Utensils } from "lucide-react";
import { useFootprint } from "../../context/FootprintContext";
import type { DietType } from "../../../utils/types";
import { LabeledSlider } from "../shared/LabeledSlider";
import { EnumSelect } from "../shared/EnumSelect";
import { TrackerShell } from "./TrackerShell";

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "high-meat", label: "High meat (>100g/day)" },
  { value: "medium-meat", label: "Medium meat (50-100g/day)" },
  { value: "low-meat", label: "Low meat (<50g/day)" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

export function DietTracker() {
  const { profile, updateSection, result } = useFootprint();
  const diet = profile.diet;
  const monthly = result.categories.find((c) => c.category === "diet")?.monthlyKg ?? 0;

  return (
    <TrackerShell
      icon={<Utensils className="size-4" />}
      title="Diet"
      monthlyKg={monthly}
    >
      <EnumSelect
        id="diet-type"
        label="Dietary pattern"
        value={diet.type}
        options={DIET_OPTIONS}
        onChange={(v) => updateSection("diet", { type: v as DietType })}
      />
      <LabeledSlider
        id="food-waste"
        label="Food wasted"
        value={diet.foodWasteKgPerWeek}
        min={0}
        max={10}
        step={0.1}
        unit="kg/wk"
        hint="Estimate edible food thrown away — leftovers, spoiled produce, plate scraps."
        onChange={(v) => updateSection("diet", { foodWasteKgPerWeek: v })}
      />
    </TrackerShell>
  );
}
