import { describe, expect, it } from "vitest";
import {
  applyFactor,
  calcEnergy,
  calcTransport,
  calcWaste,
  calculateFootprint,
  clampShare,
  co2e,
  formatCo2e,
  sanitize,
  sum,
} from "./emissionsMath";
import { GRID_ELECTRICITY, LANDFILL_WASTE } from "./emissionFactors";
import { REGIONAL_AVERAGE } from "./baseline";
import type { FootprintProfile } from "./types";

describe("sanitize", () => {
  it("passes through valid finite numbers", () => {
    expect(sanitize(42)).toBe(42);
    expect(sanitize(0)).toBe(0);
  });

  it("falls back to 0 for NaN / Infinity / null / undefined / garbage", () => {
    expect(sanitize(NaN)).toBe(0);
    expect(sanitize(Infinity)).toBe(0);
    expect(sanitize(-Infinity)).toBe(0);
    expect(sanitize(null)).toBe(0);
    expect(sanitize(undefined)).toBe(0);
    expect(sanitize("not a number")).toBe(0);
  });

  it("clamps to the supplied bounds", () => {
    expect(sanitize(-5)).toBe(0); // default min 0
    expect(sanitize(150, { min: 0, max: 100 })).toBe(100);
    expect(sanitize(50, { min: 0, max: 100 })).toBe(50);
  });

  it("respects a custom fallback", () => {
    expect(sanitize(NaN, { fallback: 7 })).toBe(7);
  });
});

describe("clampShare", () => {
  it("constrains fractions to [0,1]", () => {
    expect(clampShare(0.5)).toBe(0.5);
    expect(clampShare(-1)).toBe(0);
    expect(clampShare(2)).toBe(1);
    expect(clampShare(NaN)).toBe(0);
  });
});

describe("co2e (the protocol equation)", () => {
  it("computes Activity x Factor x GWP", () => {
    expect(co2e(10, 2)).toBe(20);
    expect(co2e(10, 2, 3)).toBe(60);
  });

  it("returns 0 for zero activity", () => {
    expect(co2e(0, 5)).toBe(0);
  });

  it("never returns NaN for bad input", () => {
    expect(co2e(NaN, 5)).toBe(0);
    expect(co2e(5, NaN)).toBe(0);
    expect(co2e(5, 2, NaN)).toBe(10); // GWP falls back to 1
    expect(Number.isFinite(co2e(Infinity, 2))).toBe(true);
  });

  it("defaults GWP to 1", () => {
    expect(co2e(4, 5)).toBe(applyFactor(4, GRID_ELECTRICITY) / GRID_ELECTRICITY.factor * 5);
  });
});

describe("applyFactor with explicit GWP", () => {
  it("multiplies methane factor by its GWP", () => {
    // 100 kg waste x 0.0207 kg CH4/kg x 28 GWP
    const expected = 100 * LANDFILL_WASTE.factor * 28;
    expect(applyFactor(100, LANDFILL_WASTE)).toBeCloseTo(expected, 6);
  });
});

describe("sum", () => {
  it("ignores non-finite entries", () => {
    expect(sum([1, 2, NaN, Infinity, 3])).toBe(6);
    expect(sum([])).toBe(0);
  });
});

describe("calcEnergy double-counting override", () => {
  const base: FootprintProfile["energy"] = {
    electricityKwh: 100,
    renewableShare: 0,
    cookingFuel: "lpg",
    cookingAmount: 0,
  };

  it("charges full grid emissions at 0% renewable", () => {
    const r = calcEnergy(base);
    expect(r.monthlyKg).toBeCloseTo(100 * GRID_ELECTRICITY.factor, 6);
  });

  it("strictly multiplies grid factor by zero at 100% solar", () => {
    const r = calcEnergy({ ...base, renewableShare: 1 });
    expect(r.monthlyKg).toBe(0);
  });

  it("scales linearly with partial renewable share", () => {
    const r = calcEnergy({ ...base, renewableShare: 0.5 });
    expect(r.monthlyKg).toBeCloseTo(50 * GRID_ELECTRICITY.factor, 6);
  });
});

describe("calcTransport", () => {
  it("returns 0 when there is no car and no travel", () => {
    const r = calcTransport({
      carFuel: "none",
      carKmPerWeek: 100,
      carEfficiency: 15,
      busKmPerWeek: 0,
      metroKmPerWeek: 0,
      twoWheelerKmPerWeek: 0,
      shortFlightsPerYear: 0,
      longFlightsPerYear: 0,
    });
    expect(r.monthlyKg).toBe(0);
  });

  it("does not divide by zero when efficiency is 0", () => {
    const r = calcTransport({
      carFuel: "petrol",
      carKmPerWeek: 100,
      carEfficiency: 0,
      busKmPerWeek: 0,
      metroKmPerWeek: 0,
      twoWheelerKmPerWeek: 0,
      shortFlightsPerYear: 0,
      longFlightsPerYear: 0,
    });
    expect(Number.isFinite(r.monthlyKg)).toBe(true);
    expect(r.monthlyKg).toBe(0);
  });
});

describe("calcWaste", () => {
  it("never produces negative totals even with heavy recycling", () => {
    const r = calcWaste({ landfillKgPerWeek: 5, recycledShare: 1 });
    expect(r.monthlyKg).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateFootprint", () => {
  it("produces finite, consistent daily/monthly totals", () => {
    const r = calculateFootprint(REGIONAL_AVERAGE);
    expect(Number.isFinite(r.totalMonthlyKg)).toBe(true);
    expect(r.totalMonthlyKg).toBeGreaterThan(0);
    expect(r.totalDailyKg).toBeCloseTo(r.totalMonthlyKg / 30.44, 6);
  });

  it("equals the sum of its categories", () => {
    const r = calculateFootprint(REGIONAL_AVERAGE);
    const summed = r.categories.reduce((a, c) => a + c.monthlyKg, 0);
    expect(r.totalMonthlyKg).toBeCloseTo(summed, 6);
  });

  it("handles an all-zero profile without crashing", () => {
    const zero: FootprintProfile = {
      energy: { electricityKwh: 0, renewableShare: 0, cookingFuel: "lpg", cookingAmount: 0 },
      transport: {
        carFuel: "none",
        carKmPerWeek: 0,
        carEfficiency: 0,
        busKmPerWeek: 0,
        metroKmPerWeek: 0,
        twoWheelerKmPerWeek: 0,
        shortFlightsPerYear: 0,
        longFlightsPerYear: 0,
      },
      diet: { type: "vegan", foodWasteKgPerWeek: 0 },
      waste: { landfillKgPerWeek: 0, recycledShare: 0 },
    };
    const r = calculateFootprint(zero);
    // Only the unavoidable diet baseline remains.
    expect(Number.isFinite(r.totalMonthlyKg)).toBe(true);
    expect(r.totalMonthlyKg).toBeGreaterThan(0);
  });
});

describe("formatCo2e", () => {
  it("formats kg and switches to tonnes above 1000", () => {
    expect(formatCo2e(12.34)).toBe("12.3 kg");
    expect(formatCo2e(1500)).toBe("1.50 t");
    expect(formatCo2e(NaN)).toBe("0.0 kg");
  });
});
