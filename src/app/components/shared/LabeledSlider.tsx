import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { sanitize } from "../../../utils/emissionsMath";

interface LabeledSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** When true, value is a 0..1 fraction shown as a percentage. */
  percent?: boolean;
  hint?: string;
  onChange: (value: number) => void;
}

/**
 * Progressive control: a slider for fast adjustment plus a manual numeric
 * override for users who want to enter exact figures from their bills.
 * All input is sanitized so the math engine never receives NaN.
 */
export function LabeledSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  percent = false,
  hint,
  onChange,
}: LabeledSliderProps) {
  const displayValue = percent ? Math.round(value * 100) : value;
  const displayMax = percent ? 100 : max;
  const displayMin = percent ? 0 : min;
  const displayStep = percent ? 1 : step;

  const commit = (raw: number) => {
    const next = percent ? sanitize(raw, { min: 0, max: 100 }) / 100 : sanitize(raw, { min, max });
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-muted-foreground">
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            min={displayMin}
            max={displayMax}
            step={displayStep}
            value={Number.isFinite(displayValue) ? displayValue : 0}
            onChange={(e) => commit(Number(e.target.value))}
            className="h-8 w-20 text-right"
            aria-label={`${label} exact value`}
          />
          {unit ? (
            <span className="w-12 text-sm text-muted-foreground">{unit}</span>
          ) : null}
        </div>
      </div>
      <Slider
        value={[displayValue]}
        min={displayMin}
        max={displayMax}
        step={displayStep}
        onValueChange={(vals) => commit(vals[0] ?? 0)}
        aria-label={label}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
