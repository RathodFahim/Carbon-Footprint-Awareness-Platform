/**
 * Regional average profile (urban India) used to pre-fill sliders and to
 * benchmark the user against a baseline. Figures approximate per-capita
 * urban household averages from CEA, MoSPI and India GHG Program data.
 */

import { calculateFootprint } from "./emissionsMath";
import type { FootprintProfile } from "./types";

export const REGIONAL_AVERAGE: FootprintProfile = {
  energy: {
    electricityKwh: 250, // monthly kWh, urban household per capita share
    renewableShare: 0,
    cookingFuel: "lpg",
    cookingAmount: 6, // kg LPG / month per capita
  },
  transport: {
    carFuel: "petrol",
    carKmPerWeek: 90,
    carEfficiency: 15, // km / litre
    busKmPerWeek: 40,
    metroKmPerWeek: 30,
    twoWheelerKmPerWeek: 60,
    shortFlightsPerYear: 1,
    longFlightsPerYear: 0,
  },
  diet: {
    type: "medium-meat",
    foodWasteKgPerWeek: 1.5,
  },
  waste: {
    landfillKgPerWeek: 5,
    recycledShare: 0.2,
  },
};

/** The default starting profile shown on first load (pre-filled with averages). */
export const DEFAULT_PROFILE: FootprintProfile = structuredClone(REGIONAL_AVERAGE);

/** Cached baseline result for comparison gauges. */
export const REGIONAL_BASELINE_RESULT = calculateFootprint(REGIONAL_AVERAGE);
