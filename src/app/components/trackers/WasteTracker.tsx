import { Trash2 } from "lucide-react";
import { useFootprint } from "../../context/FootprintContext";
import { LabeledSlider } from "../shared/LabeledSlider";
import { TrackerShell } from "./TrackerShell";

export function WasteTracker() {
  const { profile, updateSection, result } = useFootprint();
  const waste = profile.waste;
  const monthly = result.categories.find((c) => c.category === "waste")?.monthlyKg ?? 0;

  return (
    <TrackerShell
      icon={<Trash2 className="size-4" />}
      title="Waste"
      monthlyKg={monthly}
    >
      <LabeledSlider
        id="landfill"
        label="General waste produced"
        value={waste.landfillKgPerWeek}
        min={0}
        max={30}
        step={0.5}
        unit="kg/wk"
        onChange={(v) => updateSection("waste", { landfillKgPerWeek: v })}
      />
      <LabeledSlider
        id="recycled"
        label="Recycled / composted"
        value={waste.recycledShare}
        min={0}
        max={1}
        percent
        hint="Diverted waste earns an avoided-emissions credit instead of landfill methane."
        onChange={(v) => updateSection("waste", { recycledShare: v })}
      />
    </TrackerShell>
  );
}
