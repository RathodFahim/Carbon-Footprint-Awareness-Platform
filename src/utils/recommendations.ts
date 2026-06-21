/**
 * Dynamic, conditional recommendation engine.
 *
 * Each rule reads the user's current state, eliminates irrelevant advice, and
 * quantifies the exact monthly saving by computing the delta between the
 * current profile and a hypothetical "improved" profile through the same math
 * engine — guaranteeing the numbers are always internally consistent.
 */

import { DIET_DAILY, FLIGHTS } from "./emissionFactors";
import {
  calcDiet,
  calcEnergy,
  calcTransport,
  calcWaste,
} from "./emissionsMath";
import type { DietType, FootprintProfile, Recommendation } from "./types";

/** Helper: monthly saving from swapping one slice of the profile. */
function delta(before: number, after: number): number {
  return Math.max(0, before - after);
}

export function buildRecommendations(
  profile: FootprintProfile,
): Recommendation[] {
  const recs: Recommendation[] = [];

  /* ----------------------------- ENERGY ---------------------------------- */
  const energyNow = calcEnergy(profile.energy).monthlyKg;

  // Solar: only if not already mostly renewable and there is grid load.
  if (profile.energy.renewableShare < 0.8 && profile.energy.electricityKwh > 0) {
    const target = Math.min(1, profile.energy.renewableShare + 0.8);
    const after = calcEnergy({ ...profile.energy, renewableShare: target }).monthlyKg;
    recs.push({
      id: "solar",
      category: "energy",
      tier: "major-move",
      title: "Install rooftop solar",
      detail: `Cover ~${Math.round(target * 100)}% of your electricity with on-site solar.`,
      monthlySavingKg: delta(energyNow, after),
    });
  }

  // Efficient appliances: assume 15% electricity reduction.
  if (profile.energy.electricityKwh > 120) {
    const after = calcEnergy({
      ...profile.energy,
      electricityKwh: profile.energy.electricityKwh * 0.85,
    }).monthlyKg;
    recs.push({
      id: "appliances",
      category: "energy",
      tier: "habit-shift",
      title: "Upgrade to 5-star appliances & LED",
      detail: "Cutting electricity use by ~15% with efficient appliances and lighting.",
      monthlySavingKg: delta(energyNow, after),
    });
  }

  /* ---------------------------- TRANSPORT -------------------------------- */
  const transportNow = calcTransport(profile.transport).monthlyKg;

  // Shift 2 car days/week to public transit — only if they actually drive.
  if (profile.transport.carFuel !== "none" && profile.transport.carKmPerWeek > 20) {
    const shiftedKm = Math.min(profile.transport.carKmPerWeek * 0.3, profile.transport.carKmPerWeek);
    const after = calcTransport({
      ...profile.transport,
      carKmPerWeek: profile.transport.carKmPerWeek - shiftedKm,
      metroKmPerWeek: profile.transport.metroKmPerWeek + shiftedKm,
    }).monthlyKg;
    recs.push({
      id: "transit",
      category: "transport",
      tier: "habit-shift",
      title: "Swap car trips for metro/rail twice a week",
      detail: `Move ~${Math.round(shiftedKm)} km/week of driving onto rail.`,
      monthlySavingKg: delta(transportNow, after),
    });
  }

  // Switch petrol/diesel car to EV.
  if (profile.transport.carFuel === "petrol" || profile.transport.carFuel === "diesel") {
    const after = calcTransport({
      ...profile.transport,
      carFuel: "ev",
      // EV "efficiency" expressed as km per kWh.
      carEfficiency: 6,
    }).monthlyKg;
    recs.push({
      id: "ev",
      category: "transport",
      tier: "major-move",
      title: "Switch to an electric vehicle",
      detail: "Replace your combustion car with an EV charged from the grid.",
      monthlySavingKg: delta(transportNow, after),
    });
  }

  // Cut one long-haul flight.
  if (profile.transport.longFlightsPerYear >= 1) {
    const after = calcTransport({
      ...profile.transport,
      longFlightsPerYear: profile.transport.longFlightsPerYear - 1,
    }).monthlyKg;
    recs.push({
      id: "flight",
      category: "transport",
      tier: "habit-shift",
      title: "Take one fewer long-haul flight per year",
      detail: `Each long-haul return trip is ~${FLIGHTS.long.factor} kg CO2e.`,
      monthlySavingKg: delta(transportNow, after),
    });
  }

  /* ------------------------------- DIET ---------------------------------- */
  const dietNow = calcDiet(profile.diet).monthlyKg;
  const ladder: DietType[] = [
    "high-meat",
    "medium-meat",
    "low-meat",
    "vegetarian",
    "vegan",
  ];
  const idx = ladder.indexOf(profile.diet.type);

  // Only suggest eating less meat if they are NOT already vegan/vegetarian.
  if (idx >= 0 && idx < ladder.length - 1) {
    const nextDiet = ladder[idx + 1];
    const after = calcDiet({ ...profile.diet, type: nextDiet }).monthlyKg;
    recs.push({
      id: "diet-shift",
      category: "diet",
      tier: "habit-shift",
      title: `Shift towards a ${DIET_DAILY[nextDiet].label.toLowerCase()} diet`,
      detail: `Reducing animal products moves your diet to "${DIET_DAILY[nextDiet].label}".`,
      monthlySavingKg: delta(dietNow, after),
    });
  }

  // Reduce food waste — only if there is meaningful waste.
  if (profile.diet.foodWasteKgPerWeek > 0.3) {
    const after = calcDiet({
      ...profile.diet,
      foodWasteKgPerWeek: profile.diet.foodWasteKgPerWeek * 0.4,
    }).monthlyKg;
    recs.push({
      id: "food-waste",
      category: "diet",
      tier: "quick-win",
      title: "Plan meals to cut food waste by 60%",
      detail: "Batch planning and proper storage sharply cut wasted food.",
      monthlySavingKg: delta(dietNow, after),
    });
  }

  /* ------------------------------- WASTE --------------------------------- */
  const wasteNow = calcWaste(profile.waste).monthlyKg;

  // Recycle/compost more — only if there's headroom.
  if (profile.waste.recycledShare < 0.7 && profile.waste.landfillKgPerWeek > 0) {
    const target = Math.min(1, profile.waste.recycledShare + 0.5);
    const after = calcWaste({ ...profile.waste, recycledShare: target }).monthlyKg;
    recs.push({
      id: "recycle",
      category: "waste",
      tier: "quick-win",
      title: "Segregate & compost to recycle 70% of waste",
      detail: `Divert ~${Math.round(target * 100)}% of waste from landfill.`,
      monthlySavingKg: delta(wasteNow, after),
    });
  }

  // Cold wash — universal quick win, framed under energy savings.
  if (profile.energy.electricityKwh > 0) {
    const after = calcEnergy({
      ...profile.energy,
      electricityKwh: Math.max(0, profile.energy.electricityKwh - 12),
    }).monthlyKg;
    recs.push({
      id: "cold-wash",
      category: "energy",
      tier: "quick-win",
      title: "Wash clothes on cold & line-dry",
      detail: "Skipping the heater and dryer trims water-heating electricity.",
      monthlySavingKg: delta(energyNow, after),
    });
  }

  // Only surface recommendations that actually save something, sorted by impact.
  return recs
    .filter((r) => r.monthlySavingKg > 0.01)
    .sort((a, b) => b.monthlySavingKg - a.monthlySavingKg);
}

export const TIER_META: Record<
  Recommendation["tier"],
  { label: string; description: string }
> = {
  "quick-win": {
    label: "Quick Wins",
    description: "Low effort · High impact",
  },
  "habit-shift": {
    label: "Habit Shifts",
    description: "Medium effort · Sustained impact",
  },
  "major-move": {
    label: "Major Moves",
    description: "High effort · Transformational impact",
  },
};
