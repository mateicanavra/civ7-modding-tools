import { describe, expect, it } from "bun:test";
import { earthThermalReference as reference } from "../../fixtures/earth-thermal/reference.js";

describe("Earth low-relief thermal reference (diagnostic, not default calibration)", () => {
  it("retains source pins, physical units, positive area weights, and explicit disjoint cohorts", () => {
    expect(reference.sources.map(({ sha256 }) => sha256)).toEqual([
      "c86a3c575010ca2c9414b24022361c43be6966dcdc62c821c1918e9c44ca9be9",
      "0862a41820743c04e94c89b0475d734232f517431951dd9d413658e87d6f5d88",
      "e3a662d0421dd70d5a18ca1404495fb3eedf75d21472f648e91669dee64097dc",
    ]);
    expect(reference.sources.reduce((sum, source) => sum + source.bytes, 0)).toBe(1046482);
    expect(reference.units).toEqual({
      sourceTemperature: "K",
      referenceTemperature: "C",
      temperatureOffset: -273.15,
      sourceHeight: "geopotential m",
      modelReliefConversion: "none",
    });
    expect(reference.period.calendar).toBe("Gregorian");
    expect(reference.period.monthWeightsDays[1]).toBeCloseTo(28 + 8 / 30, 10);
    expect(reference.period.monthWeightsDays.reduce((sum, days) => sum + days, 0)).toBeCloseTo(365 + 8 / 30, 10);
    expect(reference.samples).toHaveLength(411);
    expect(new Set(reference.samples.map((sample) => `${sample.sourceRow}:${sample.sourceColumn}`)).size).toBe(411);
    for (const sample of reference.samples) {
      expect(Object.values(sample).every((value) => typeof value !== "number" || Number.isFinite(value))).toBe(true);
      expect(sample.areaWeight).toBeGreaterThan(0);
      expect(Math.abs(sample.sourceHeightM)).toBeLessThanOrEqual(250);
      expect(sample.sourceNeighborhoodReliefM).toBeGreaterThanOrEqual(0);
      expect(sample.sourceNeighborhoodReliefM).toBeLessThanOrEqual(250);
      expect(Math.abs(sample.latitudeDegrees)).toBeLessThan(90);
      expect(sample.annualAirTemperatureC).toBeGreaterThanOrEqual(150 - 273.15);
      expect(sample.annualAirTemperatureC).toBeLessThanOrEqual(400 - 273.15);
      expect(sample.monthlyAirTemperatureRangeC).toBeGreaterThanOrEqual(0);
      const bands = sample.split === "train"
        ? reference.split.trainAbsoluteLatitudeBands
        : reference.split.holdoutAbsoluteLatitudeBands;
      expect(bands.some(([low, high]) => Math.abs(sample.latitudeDegrees) >= low! && Math.abs(sample.latitudeDegrees) < high!)).toBe(true);
      expect(["train", "holdout"]).toContain(sample.split);
    }
    expect(reference.samples.filter((sample) => sample.split === "train")).toHaveLength(196);
    expect(reference.samples.filter((sample) => sample.split === "holdout")).toHaveLength(215);
  });

});
