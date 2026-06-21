/**
 * Hardcoded baseline emission factors.
 *
 * Sources:
 *  - Grid electricity: Central Electricity Authority (CEA) of India,
 *    CO2 Baseline Database — national grid average ~0.716 kg CO2e/kWh.
 *  - Fuels: India GHG Program / IPCC 2006 Guidelines, Vol. 2.
 *  - Diet: Scarborough et al. + India GHG Program dietary footprints.
 *  - Waste: IPCC Waste Model (landfill CH4, GWP 28).
 *  - Aviation: DEFRA / ICAO with radiative forcing uplift.
 *
 * All factors are kg CO2e per stated unit unless a separate `gwp` is given.
 */

import type {
  CarFuel,
  CookingFuel,
  DietType,
  EmissionFactor,
} from "./types";

export const WEEKS_PER_MONTH = 4.345; // 52.14 / 12
export const DAYS_PER_MONTH = 30.44; // 365.25 / 12
export const MONTHS_PER_YEAR = 12;

export const GRID_ELECTRICITY: EmissionFactor = {
  id: "grid-electricity",
  label: "Grid electricity",
  factor: 0.716,
  unit: "kWh",
  source: "CEA India CO2 Baseline Database",
};

export const COOKING_FUELS: Record<CookingFuel, EmissionFactor> = {
  lpg: {
    id: "lpg",
    label: "LPG (cooking)",
    factor: 2.983,
    unit: "kg",
    source: "IPCC 2006 Vol.2 (LPG)",
  },
  png: {
    id: "png",
    label: "Piped natural gas",
    factor: 2.02,
    unit: "scm",
    source: "IPCC 2006 Vol.2 (Natural gas)",
  },
  electric: {
    id: "electric-cooking",
    label: "Electric cooking",
    factor: 0.716,
    unit: "kWh",
    source: "CEA India grid average",
  },
  induction: {
    id: "induction-cooking",
    label: "Induction cooking",
    factor: 0.716,
    unit: "kWh",
    source: "CEA India grid average",
  },
};

/**
 * Per-litre (or per-kWh for EV) tailpipe + upstream factors.
 * EV is charged from the grid, so its effective factor is grid-derived.
 */
export const CAR_FUELS: Record<CarFuel, EmissionFactor> = {
  petrol: {
    id: "petrol",
    label: "Petrol car",
    factor: 2.31,
    unit: "litre",
    source: "IPCC 2006 / India GHG Program (motor gasoline)",
  },
  diesel: {
    id: "diesel",
    label: "Diesel car",
    factor: 2.68,
    unit: "litre",
    source: "IPCC 2006 / India GHG Program (gas/diesel oil)",
  },
  cng: {
    id: "cng",
    label: "CNG car",
    factor: 2.16,
    unit: "kg",
    source: "IPCC 2006 (compressed natural gas)",
  },
  ev: {
    id: "ev",
    label: "Electric vehicle",
    factor: 0.716,
    unit: "kWh",
    source: "CEA India grid average",
  },
  none: {
    id: "no-car",
    label: "No car",
    factor: 0,
    unit: "km",
    source: "n/a",
  },
};

/** Per passenger-km factors for public / shared transport. */
export const TRANSPORT_PER_KM: Record<string, EmissionFactor> = {
  bus: {
    id: "bus",
    label: "Bus",
    factor: 0.105,
    unit: "km",
    source: "India GHG Program (city bus, per pax-km)",
  },
  metro: {
    id: "metro",
    label: "Metro / rail",
    factor: 0.041,
    unit: "km",
    source: "India GHG Program (electric rail, per pax-km)",
  },
  twoWheeler: {
    id: "two-wheeler",
    label: "Two-wheeler",
    factor: 0.0448,
    unit: "km",
    source: "India GHG Program (motorcycle, per km)",
  },
};

/** Per return-flight factors (average sector distance x per-km with RF uplift). */
export const FLIGHTS: Record<"short" | "long", EmissionFactor> = {
  short: {
    id: "short-flight",
    label: "Short-haul return flight",
    factor: 460,
    unit: "trip",
    source: "DEFRA short-haul (~1500 km return, RF-uplifted)",
  },
  long: {
    id: "long-flight",
    label: "Long-haul return flight",
    factor: 2600,
    unit: "trip",
    source: "DEFRA long-haul (~8000 km return, RF-uplifted)",
  },
};

/** Per-day dietary footprint in kg CO2e (food production only). */
export const DIET_DAILY: Record<DietType, EmissionFactor> = {
  "high-meat": {
    id: "diet-high-meat",
    label: "High meat (>100g/day)",
    factor: 7.19,
    unit: "day",
    source: "Scarborough et al. 2014 (adapted)",
  },
  "medium-meat": {
    id: "diet-medium-meat",
    label: "Medium meat (50-100g/day)",
    factor: 5.63,
    unit: "day",
    source: "Scarborough et al. 2014 (adapted)",
  },
  "low-meat": {
    id: "diet-low-meat",
    label: "Low meat (<50g/day)",
    factor: 4.67,
    unit: "day",
    source: "Scarborough et al. 2014 (adapted)",
  },
  vegetarian: {
    id: "diet-vegetarian",
    label: "Vegetarian",
    factor: 3.81,
    unit: "day",
    source: "Scarborough et al. 2014 (adapted)",
  },
  vegan: {
    id: "diet-vegan",
    label: "Vegan",
    factor: 2.89,
    unit: "day",
    source: "Scarborough et al. 2014 (adapted)",
  },
};

export const FOOD_WASTE: EmissionFactor = {
  id: "food-waste",
  label: "Food waste",
  factor: 2.5,
  unit: "kg",
  source: "FAO / IPCC (avg food production + landfill CH4)",
};

/** Landfill general waste — methane heavy, GWP applied explicitly. */
export const LANDFILL_WASTE: EmissionFactor = {
  id: "landfill-waste",
  label: "Landfill waste",
  factor: 0.0207, // tonnes CH4 -> expressed as kg CH4 per kg waste
  gwp: 28, // CH4 GWP-100 (IPCC AR5)
  unit: "kg",
  source: "IPCC Waste Model (mixed MSW, CH4)",
};

export const RECYCLING_CREDIT: EmissionFactor = {
  id: "recycling-credit",
  label: "Recycling / composting avoided",
  factor: -0.21, // net avoided emissions per kg diverted
  unit: "kg",
  source: "EPA WARM (mixed recyclables, avoided)",
};
