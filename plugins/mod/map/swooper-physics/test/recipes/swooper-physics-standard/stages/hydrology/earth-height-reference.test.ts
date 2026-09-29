import { beforeAll, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import reference from "../../fixtures/earth-thermal/noaa-land-thermal.json";
import original from "../../fixtures/earth-thermal/monthly-low-relief-land.json";
import { encodeEarthHeight, heightStudyProtocol, runEarthHeightStudy, runHeightThermalArms } from "../../fixtures/earth-thermal/height-study.js";
import { responseMonthWeightsDays } from "../../fixtures/earth-thermal/response-harmonics.js";

const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
let study: ReturnType<typeof runEarthHeightStudy>;

describe("Fixed Earth height through admitted thermal operations", () => {
  beforeAll(() => { study = runEarthHeightStudy(reference.samples); });

  it("pins the full land reference and preserves the exact original 411 cells and source units", async () => {
    const fixture = new URL("../../fixtures/earth-thermal/noaa-land-thermal.json", import.meta.url);
    expect(hash(await readFile(fixture))).toBe(heightStudyProtocol.referenceSha256);
    expect(reference.sources).toEqual(original.sources);
    expect(reference.lowReliefCohort.annualFixture.sha256).toBe(heightStudyProtocol.annualLowReliefSha256);
    expect(reference.lowReliefCohort.monthlyFixture.sha256).toBe(heightStudyProtocol.monthlyLowReliefSha256);
    expect(hash(await readFile(new URL("../../fixtures/earth-thermal/monthly-low-relief-land.json", import.meta.url)))).toBe(heightStudyProtocol.monthlyLowReliefSha256);
    expect(hash(await readFile(new URL("../../fixtures/earth-thermal/noaa-low-relief-land.json", import.meta.url)))).toBe(heightStudyProtocol.annualLowReliefSha256);
    expect(reference.variables.hgt.long_name).toBe("Geopotential Height at the Surface");
    expect(reference.units.modelReliefConversion).toBe("none");
    expect(reference.period.monthWeightsDays).toEqual(responseMonthWeightsDays);
    expect(reference.samples).toHaveLength(5914);
    expect(new Set(reference.samples.map((sample) => `${sample.sourceRow}:${sample.sourceColumn}`)).size).toBe(5914);
    expect(reference.samples.filter((sample) => sample.within80DegreeEvaluationCrop)).toHaveLength(4970);
    expect(reference.samples.filter((sample) => sample.sourceHeightM < 0)).toHaveLength(80);
    const originals = new Map(original.samples.map((sample) => [`${sample.sourceRow}:${sample.sourceColumn}`, sample]));
    for (const sample of reference.samples) {
      expect(sample.latitudeDegrees).toBe(reference.sourceGrid.latitudeDegrees[sample.sourceRow]!);
      expect(sample.longitudeDegreesEast).toBe(reference.sourceGrid.longitudeDegreesEast[sample.sourceColumn]!);
      expect(sample.areaWeight).toBe(reference.sourceGrid.gaussianLatitudeWeights[sample.sourceRow]!);
      const previous = originals.get(`${sample.sourceRow}:${sample.sourceColumn}`);
      expect(sample.lowReliefMembership).toBe(previous?.split ?? null);
      if (!previous) continue;
      for (const field of ["latitudeDegrees", "longitudeDegreesEast", "areaWeight", "sourceHeightM", "annualAirTemperatureC", "monthlyAirTemperatureRangeC", "monthlyAirTemperatureC"] as const) {
        expect(sample[field]).toEqual(previous[field]);
      }
    }
    expect(reference.samples.filter((sample) => sample.lowReliefMembership === "train")).toHaveLength(196);
    expect(reference.samples.filter((sample) => sample.lowReliefMembership === "holdout")).toHaveLength(215);
    expect(reference.samples.filter((sample) => sample.lowReliefMembership === null)).toHaveLength(5503);
  });

  it("keeps inputs immutable and proves unclipped continuous harmonics and independent annual publication", () => {
    expect(study.inputImmutabilityVerified).toBe(true);
    expect(study.solarInput.width).toBe(1);
    expect(study.solarInput.height).toBe(5914);
    expect(study.arms.map((arm) => arm.id)).toEqual(["zero-height", "q1", "q10"]);
    for (const evidence of study.summary.numericalEvidence) {
      expect(evidence.maxAnnualClippingDeltaC).toBe(0);
      expect(evidence.conservativeMinC).toBeGreaterThan(-120 + heightStudyProtocol.float32BudgetC);
      expect(evidence.conservativeMaxC).toBeLessThan(120 - heightStudyProtocol.float32BudgetC);
      expect(evidence.maxAnnualCalendarDifferenceC).toBeLessThan(heightStudyProtocol.float32BudgetC);
      expect(evidence.seaLevelPressureInputsExact).toBe(true);
    }
    for (const arm of study.arms) {
      expect(arm.result.annualSurfaceTemperatureC).toEqual(arm.result.annualUnclippedSurfaceTemperatureC);
      expect(arm.config.config.annualOffsetC).toBe(0);
      expect(arm.config.config.lapseRateCPerElevationUnit).toBe(arm.metresPerModelUnit * -0.0065);
      for (let row = 0; row < reference.samples.length; row++) {
        const source = reference.samples[row]!;
        expect(arm.input.elevation[row]).toBe(Math.round((arm.zeroHeight ? 0 : source.sourceHeightM) / arm.metresPerModelUnit) || 0);
      }
    }
  });

  it("bounds q1/q10 covariance by declared encoding error, not a climate-accuracy tolerance", () => {
    const evidence = study.summary.covariance;
    expect(evidence.roundingBoundC).toBe(Math.abs(-0.0065) * (1 + 10) / 2);
    for (const delta of [evidence.maxSampleDeltaC, evidence.maxMonthlyDeltaC, evidence.maxAnnualDeltaC]) {
      expect(delta).toBeLessThanOrEqual(evidence.roundingBoundC + evidence.float32BudgetC);
    }
    expect(evidence.maxAnnualDeltaC).toBeGreaterThan(0);
  });

  it("retains below-sea-level evidence while separately exposing the production lapse clamp", () => {
    const zero = study.arms[0]!;
    for (const [row, sample] of reference.samples.entries()) {
      if (sample.sourceHeightM >= 0) continue;
      expect(study.arms[1]!.input.elevation[row]).toBe(sample.sourceHeightM);
      for (const arm of study.arms.slice(1)) {
        expect(arm.input.elevation[row]).toBeLessThanOrEqual(0);
        expect(arm.records[row]!.monthlyC).toEqual(zero.records[row]!.monthlyC);
        expect(arm.result.annualSurfaceTemperatureC[row]).toBe(zero.result.annualSurfaceTemperatureC[row]);
        for (const [phase, output] of arm.result.samples.entries()) {
          expect(output.surfaceTemperatureC[row]).toBe(zero.result.samples[phase]!.surfaceTemperatureC[row]);
        }
      }
    }
    expect(study.summary.cohorts.find((cohort) => cohort.scope === "global" && cohort.group === "altitude:below-sea-level")!.count).toBe(80);
  });

  it("has exact-grid covariance witnesses and applies one analytic lapse without changing sea-level pressure inputs", () => {
    const rows = [-100, 0, 1000, 2000, 4000].map((sourceHeightM) => ({ latitudeDegrees: 30, sourceHeightM }));
    const held = structuredClone(rows);
    const [zero, q1, q10] = runHeightThermalArms(rows).arms;
    expect(rows).toEqual(held);
    expect(q1!.result).toEqual(q10!.result);
    for (const [row, source] of rows.entries()) {
      const lapse = Math.max(0, source.sourceHeightM) * -0.0065;
      expect(q1!.result.meanSeaLevelTemperatureC[row]).toBe(zero!.result.meanSeaLevelTemperatureC[row]);
      expect(Math.abs(q1!.records[row]!.annualPublishedC - zero!.records[row]!.annualPublishedC - lapse)).toBeLessThan(heightStudyProtocol.float32BudgetC);
      for (const [phase, sample] of q1!.result.samples.entries()) {
        expect(sample.seaLevelTemperatureC[row]).toBe(zero!.result.samples[phase]!.seaLevelTemperatureC[row]);
        expect(Math.abs(sample.surfaceTemperatureC[row]! - zero!.result.samples[phase]!.surfaceTemperatureC[row]! - lapse)).toBeLessThan(heightStudyProtocol.float32BudgetC);
      }
    }
  });

  it("rejects invalid encoding before typed-array overflow", () => {
    expect(encodeEarthHeight(-32768, 1)).toBe(-32768);
    expect(encodeEarthHeight(32767, 1)).toBe(32767);
    for (const [height, q] of [[32768, 1], [-32769, 1], [NaN, 1], [Infinity, 10], [100, 0], [100, -1], [100, Infinity]]) {
      expect(() => encodeEarthHeight(height!, q!)).toThrow(RangeError);
    }
  });

  it("reports weighted global/cropped, latitude, altitude and original-split errors without tuning a quality gate", () => {
    for (const scope of ["global", "crop80"]) {
      const cohorts = study.summary.cohorts.filter((cohort) => cohort.scope === scope);
      const all = cohorts.find((cohort) => cohort.group === "all")!;
      expect(all.count).toBe(scope === "global" ? 5914 : 4970);
      for (const prefix of ["latitude:", "altitude:"]) {
        const partition = cohorts.filter((cohort) => cohort.group.startsWith(prefix));
        expect(partition.reduce((sum, cohort) => sum + cohort.count, 0)).toBe(all.count);
        expect(partition.reduce((sum, cohort) => sum + cohort.areaWeight, 0)).toBeCloseTo(all.areaWeight, 10);
      }
      expect(cohorts.find((cohort) => cohort.group === "original-train")!.count).toBe(196);
      expect(cohorts.find((cohort) => cohort.group === "original-holdout")!.count).toBe(215);
      for (const cohort of cohorts) {
        expect(cohort.errors.map((error) => error.arm)).toEqual(["zero-height", "q1", "q10"]);
        for (const error of cohort.errors) {
          expect(Object.values(error.annual).every(Number.isFinite)).toBe(true);
          expect(Object.values(error.monthly).every(Number.isFinite)).toBe(true);
        }
      }
    }
  });
});
