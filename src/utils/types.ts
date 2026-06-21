/**
 * Strict TypeScript domain model for the Carbon Footprint engine.
 *
 * All emission factors are expressed in kg CO2e per unit of activity, already
 * weighted by the Global Warming Potential (GWP) of the underlying gas mix
 * (CO2 = 1, CH4 = 28, N2O = 265 over a 100-year horizon, per the IPCC AR5).
 * The core math still applies GWP explicitly so the protocol equation
 *   CO2e = Activity Data x Emission Factor x GWP
 * is honoured and auditable for every line item.
 */

export type Category = "energy" | "transport" | "diet" | "waste";

/** A single auditable greenhouse-gas line item. */
export interface EmissionFactor {
  /** Stable identifier used as a React key and lookup token. */
  readonly id: string;
  /** Human readable label. */
  readonly label: string;
  /** kg CO2e per unit (already GWP-weighted unless gwp != 1). */
  readonly factor: number;
  /** Unit of the activity data (e.g. "km", "kWh", "kg"). */
  readonly unit: string;
  /** Global Warming Potential applied on top of the factor. Defaults to 1. */
  readonly gwp?: number;
  /** Provenance of the factor for transparency. */
  readonly source: string;
}

export type DietType = "high-meat" | "medium-meat" | "low-meat" | "vegetarian" | "vegan";

export type CarFuel = "petrol" | "diesel" | "cng" | "ev" | "none";

export type CookingFuel = "lpg" | "png" | "electric" | "induction";

/** The complete, normalized user profile that drives every calculation. */
export interface FootprintProfile {
  energy: {
    /** Monthly grid electricity consumption in kWh (from the bill). */
    electricityKwh: number;
    /** Fraction [0..1] of electricity supplied by on-site renewables (solar). */
    renewableShare: number;
    /** Cooking fuel type. */
    cookingFuel: CookingFuel;
    /** Monthly cooking fuel usage: kg for LPG, scm for PNG, kWh for electric. */
    cookingAmount: number;
  };
  transport: {
    carFuel: CarFuel;
    /** Weekly distance driven by personal car in km. */
    carKmPerWeek: number;
    /** Realistic fuel economy in km per litre (or km/kWh for EV). */
    carEfficiency: number;
    /** Weekly distance on bus in km. */
    busKmPerWeek: number;
    /** Weekly distance on metro / suburban rail in km. */
    metroKmPerWeek: number;
    /** Weekly distance on two-wheeler in km. */
    twoWheelerKmPerWeek: number;
    /** Number of short-haul return flights per year. */
    shortFlightsPerYear: number;
    /** Number of long-haul return flights per year. */
    longFlightsPerYear: number;
  };
  diet: {
    type: DietType;
    /** Estimated food wasted per week in kg. */
    foodWasteKgPerWeek: number;
  };
  waste: {
    /** General (landfill) waste produced per week in kg. */
    landfillKgPerWeek: number;
    /** Fraction [0..1] of total waste that is recycled / composted. */
    recycledShare: number;
  };
}

/** Result of evaluating one category, in kg CO2e per month. */
export interface CategoryResult {
  category: Category;
  label: string;
  monthlyKg: number;
  /** Itemized contributions for transparency / charts. */
  breakdown: { id: string; label: string; monthlyKg: number }[];
}

export interface FootprintResult {
  categories: CategoryResult[];
  totalMonthlyKg: number;
  totalDailyKg: number;
}

export type EffortTier = "quick-win" | "habit-shift" | "major-move";

export interface Recommendation {
  id: string;
  category: Category;
  tier: EffortTier;
  title: string;
  detail: string;
  /** Quantified monthly saving in kg CO2e if adopted. */
  monthlySavingKg: number;
}
