import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import {
  earthThermalReference as reference,
  earthThermalReferenceProfiles as profiles,
} from "../../fixtures/earth-thermal/reference.js";

type Profile = (typeof profiles)[keyof typeof profiles];
type Sample = (typeof reference.samples)[number];
type ErrorSummary = Readonly<{ biasC: number; rmseC: number; maeC: number }>;

function evaluate(profile: Profile) {
  const width = 1;
  const height = reference.samples.length;
  const elevation = new Int16Array(height);
  const landMask = new Uint8Array(height).fill(1);
  // Each row is an independent diagnostic sample, not a reconstructed geographic grid.
  const seasonal = profile.declinationsDegrees.map((declination) => {
    const latitudeByRow = Float32Array.from(reference.samples, (sample) =>
      Math.max(-89.999, Math.min(89.999, sample.latitudeDegrees - declination))
    );
    const forcing = runAdmittedOperationForTest(
      hydrology.climate.ops.computeRadiativeForcing,
      { model: "latitude-insolation", width, height, latitudeByRow },
      profile.forcing
    );
    if (forcing.model !== "latitude-insolation") throw new Error("Expected legacy reference forcing.");
    const thermal = runAdmittedOperationForTest(
      hydrology.climate.ops.computeThermalState,
      { model: "insolation-lapse-rate", width, height, elevation, seaLevel: 0, landMask, insolation: forcing.insolation },
      profile.thermal
    );
    if (thermal.model !== "insolation-lapse-rate") throw new Error("Expected legacy reference thermal field.");
    return thermal.surfaceTemperatureC;
  });
  const annual = Float32Array.from(reference.samples, (_, index) =>
    seasonal.reduce((sum, field) => sum + field[index]!, 0) / seasonal.length
  );
  return { annual, seasonal };
}

function summarize(values: Float32Array, selected: (sample: Sample) => boolean): ErrorSummary {
  let weight = 0;
  let error = 0;
  let squaredError = 0;
  let absoluteError = 0;
  reference.samples.forEach((sample, index) => {
    if (!selected(sample)) return;
    const delta = values[index]! - sample.annualAirTemperatureC;
    weight += sample.areaWeight;
    error += sample.areaWeight * delta;
    squaredError += sample.areaWeight * delta * delta;
    absoluteError += sample.areaWeight * Math.abs(delta);
  });
  if (weight <= 0) throw new Error("A diagnostic cohort must contain positive source area.");
  return { biasC: error / weight, rmseC: Math.sqrt(squaredError / weight), maeC: absoluteError / weight };
}

function expectOfflineParity(actual: ErrorSummary, expected: ErrorSummary) {
  // Numerical parity with the frozen float64 analysis, not a scientific acceptance threshold.
  for (const key of ["biasC", "rmseC", "maeC"] as const) {
    expect(Math.abs(actual[key] - expected[key])).toBeLessThan(0.0001);
  }
}

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

  it("replays the frozen alternating-band fit through both admitted production operations", () => {
    const result = evaluate(profiles.alternatingBandFit);
    expectOfflineParity(summarize(result.annual, (sample) => sample.split === "train"), {
      biasC: 0, rmseC: 2.5586891902512763, maeC: 1.9869975924388266,
    });
    expectOfflineParity(summarize(result.annual, (sample) => sample.split === "holdout"), {
      biasC: -1.4486146897068723, rmseC: 3.034830355662527, maeC: 2.5529323693891213,
    });
    expect(Array.from(result.annual).every(Number.isFinite)).toBe(true);
    expect(evaluate(profiles.alternatingBandFit)).toEqual(result);
  });

  it("keeps the original neutral baseline and retired unseasonal refine as literal comparisons", () => {
    expectOfflineParity(summarize(evaluate(profiles.originalNeutralBaseline).annual, () => true), {
      biasC: 16.528906658312117, rmseC: 16.769517771418894, maeC: 16.528906658312117,
    });
    expectOfflineParity(summarize(evaluate(profiles.retiredNeutralRefine).annual, () => true), {
      biasC: 0.5491552851150707, rmseC: 4.058372749692529, maeC: 3.1321808009702665,
    });
  });

  it("retains the tropical seasonality mismatch instead of treating annual fit as seasonal proof", () => {
    const { seasonal } = evaluate(profiles.alternatingBandFit);
    let weight = 0;
    let predictedRange = 0;
    let referenceRange = 0;
    reference.samples.forEach((sample, index) => {
      if (Math.abs(sample.latitudeDegrees) >= 15) return;
      const phases = seasonal.map((field) => field[index]!);
      weight += sample.areaWeight;
      predictedRange += sample.areaWeight * (Math.max(...phases) - Math.min(...phases));
      referenceRange += sample.areaWeight * sample.monthlyAirTemperatureRangeC;
    });
    // Four instantaneous solar phases and monthly climatology have different averaging and lag.
    expect(predictedRange / weight).toBeCloseTo(12.272106190929465, 4);
    expect(referenceRange / weight).toBeCloseTo(3.2777380996719816, 8);
  });
});
