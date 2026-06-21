/**
 * Core greenhouse-gas calculation engine.
 *
 * Every line item rolls up into the GHG Protocol equation:
 *
 *     CO2e = Activity Data x Emission Factor x GWP
 *
 * The module is built from pure, side-effect-free functions so it can be
 * unit-tested in isolation and memoized safely in React.
 */

import {
  CAR_FUELS,
  COOKING_FUELS,
  DAYS_PER_MONTH,
  DIET_DAILY,
  FLIGHTS,
  FOOD_WASTE,
  GRID_ELECTRICITY,
  LANDFILL_WASTE,
  MONTHS_PER_YEAR,
  RECYCLING_CREDIT,
  TRANSPORT_PER_KM,
  WEEKS_PER_MONTH,
} from "./emissionFactors";
import type {
  CategoryResult,
  EmissionFactor,
  FootprintProfile,
  FootprintResult,
} from "./types";

/**
 * Coerce arbitrary user/runtime input into a safe, finite number.
 * Guards against NaN, Infinity, null, undefined and negative values
 * (which are non-physical for activity data), with an optional clamp.
 */
export function sanitize(
  value: unknown,
  { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {},
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

/** Clamp a fraction into the inclusive [0, 1] range. */
export function clampShare(value: unknown): number {
  return sanitize(value, { min: 0, max: 1, fallback: 0 });
}

/**
 * The canonical protocol equation. Always returns a finite number.
 *
 * @param activityData  Amount of activity (km, kWh, kg, trips, days...).
 * @param emissionFactor kg CO2e per unit of activity.
 * @param gwp           Global Warming Potential multiplier (defaults to 1).
 */
export function co2e(
  activityData: number,
  emissionFactor: number,
  gwp = 1,
): number {
  const a = sanitize(activityData);
  const f = Number.isFinite(emissionFactor) ? emissionFactor : 0;
  const g = Number.isFinite(gwp) ? gwp : 1;
  const result = a * f * g;
  return Number.isFinite(result) ? result : 0;
}

/** Apply the protocol equation using an {@link EmissionFactor} definition. */
export function applyFactor(activityData: number, ef: EmissionFactor): number {
  return co2e(activityData, ef.factor, ef.gwp ?? 1);
}

/* -------------------------------------------------------------------------- */
/*  Category calculators — each returns kg CO2e per MONTH                      */
/* -------------------------------------------------------------------------- */

export function calcEnergy(p: FootprintProfile["energy"]): CategoryResult {
  const kwh = sanitize(p.electricityKwh);
  const renewable = clampShare(p.renewableShare);

  // Double-counting / override guard: 100% solar => grid factor x 0.
  const gridChargeableKwh = kwh * (1 - renewable);
  const electricityKg = applyFactor(gridChargeableKwh, GRID_ELECTRICITY);

  const cookingEf = COOKING_FUELS[p.cookingFuel] ?? COOKING_FUELS.lpg;
  const cookingKg = applyFactor(sanitize(p.cookingAmount), cookingEf);

  const breakdown = [
    { id: GRID_ELECTRICITY.id, label: "Electricity", monthlyKg: electricityKg },
    { id: cookingEf.id, label: cookingEf.label, monthlyKg: cookingKg },
  ];

  return {
    category: "energy",
    label: "Home Energy",
    monthlyKg: sum(breakdown.map((b) => b.monthlyKg)),
    breakdown,
  };
}

export function calcTransport(p: FootprintProfile["transport"]): CategoryResult {
  const fuel = CAR_FUELS[p.carFuel] ?? CAR_FUELS.none;
  const carKmMonth = sanitize(p.carKmPerWeek) * WEEKS_PER_MONTH;
  // km / (km per unit-of-fuel) = units of fuel consumed.
  const efficiency = sanitize(p.carEfficiency);
  const fuelUnits = efficiency > 0 && fuel.id !== "no-car"
    ? carKmMonth / efficiency
    : 0;
  const carKg = applyFactor(fuelUnits, fuel);

  const busKg = applyFactor(
    sanitize(p.busKmPerWeek) * WEEKS_PER_MONTH,
    TRANSPORT_PER_KM.bus,
  );
  const metroKg = applyFactor(
    sanitize(p.metroKmPerWeek) * WEEKS_PER_MONTH,
    TRANSPORT_PER_KM.metro,
  );
  const twoWheelerKg = applyFactor(
    sanitize(p.twoWheelerKmPerWeek) * WEEKS_PER_MONTH,
    TRANSPORT_PER_KM.twoWheeler,
  );

  const shortFlightKg =
    applyFactor(sanitize(p.shortFlightsPerYear), FLIGHTS.short) / MONTHS_PER_YEAR;
  const longFlightKg =
    applyFactor(sanitize(p.longFlightsPerYear), FLIGHTS.long) / MONTHS_PER_YEAR;

  const breakdown = [
    { id: "car", label: fuel.label, monthlyKg: carKg },
    { id: "two-wheeler", label: "Two-wheeler", monthlyKg: twoWheelerKg },
    { id: "bus", label: "Bus", monthlyKg: busKg },
    { id: "metro", label: "Metro / rail", monthlyKg: metroKg },
    { id: "flights", label: "Flights", monthlyKg: shortFlightKg + longFlightKg },
  ];

  return {
    category: "transport",
    label: "Transport",
    monthlyKg: sum(breakdown.map((b) => b.monthlyKg)),
    breakdown,
  };
}

export function calcDiet(p: FootprintProfile["diet"]): CategoryResult {
  const dietEf = DIET_DAILY[p.type] ?? DIET_DAILY["medium-meat"];
  const dietKg = applyFactor(DAYS_PER_MONTH, dietEf);
  const wasteKg = applyFactor(
    sanitize(p.foodWasteKgPerWeek) * WEEKS_PER_MONTH,
    FOOD_WASTE,
  );

  const breakdown = [
    { id: dietEf.id, label: "Food production", monthlyKg: dietKg },
    { id: FOOD_WASTE.id, label: "Food waste", monthlyKg: wasteKg },
  ];

  return {
    category: "diet",
    label: "Diet",
    monthlyKg: sum(breakdown.map((b) => b.monthlyKg)),
    breakdown,
  };
}

export function calcWaste(p: FootprintProfile["waste"]): CategoryResult {
  const totalKgMonth = sanitize(p.landfillKgPerWeek) * WEEKS_PER_MONTH;
  const recycledShare = clampShare(p.recycledShare);

  const landfillKg = applyFactor(totalKgMonth * (1 - recycledShare), LANDFILL_WASTE);
  // Recycling credit is a negative factor; never let total category go below 0.
  const recyclingKg = applyFactor(totalKgMonth * recycledShare, RECYCLING_CREDIT);

  const monthlyKg = Math.max(0, landfillKg + recyclingKg);

  const breakdown = [
    { id: LANDFILL_WASTE.id, label: "Landfill", monthlyKg: landfillKg },
    {
      id: RECYCLING_CREDIT.id,
      label: "Recycling credit",
      monthlyKg: recyclingKg,
    },
  ];

  return {
    category: "waste",
    label: "Waste",
    monthlyKg,
    breakdown,
  };
}

/** Aggregate the full profile into a single auditable result. */
export function calculateFootprint(profile: FootprintProfile): FootprintResult {
  const categories: CategoryResult[] = [
    calcEnergy(profile.energy),
    calcTransport(profile.transport),
    calcDiet(profile.diet),
    calcWaste(profile.waste),
  ];

  const totalMonthlyKg = sum(categories.map((c) => c.monthlyKg));

  return {
    categories,
    totalMonthlyKg,
    totalDailyKg: totalMonthlyKg / DAYS_PER_MONTH,
  };
}

/** NaN-safe summation. */
export function sum(values: number[]): number {
  return values.reduce<number>(
    (acc, v) => acc + (Number.isFinite(v) ? v : 0),
    0,
  );
}

/** Format kg CO2e for display, switching to tonnes for large values. */
export function formatCo2e(kg: number): string {
  const safe = Number.isFinite(kg) ? kg : 0;
  if (Math.abs(safe) >= 1000) {
    return `${(safe / 1000).toFixed(2)} t`;
  }
  return `${safe.toFixed(1)} kg`;
}
