import { describe, expect, it } from "bun:test";
import { weightedMonthlyMean } from "../../fixtures/earth-thermal/response-harmonics.js";
import { replayProductionThermalReference } from "../../fixtures/earth-thermal/production-replay.js";

describe("Earth reference through production periodic response", () => {
  it("preserves the frozen response and reports the distinct solar representation delta", () => {
    const result = replayProductionThermalReference();
    expect(result.cohorts.map((cohort) => cohort.count)).toEqual([196, 215, 411]);
    // These are Float32 replay/integration budgets, not tuned climate-quality targets.
    expect(result.frozenReplayMaxErrorC).toBeLessThan(0.00001);
    expect(result.solarRepresentationMaxDeltaC).toBeGreaterThan(0.001);
    expect(result.solarRepresentationMaxDeltaC).toBeLessThan(0.006);
    for (const cohort of result.cohorts) {
      const oracle = cohort.errors.find((arm) => arm.arm === "oracle")!;
      const production = cohort.errors.find((arm) => arm.arm === "frozen")!;
      expect(Math.abs(oracle.monthlyRmseC - production.monthlyRmseC)).toBeLessThan(0.00001);
      expect(Math.abs(oracle.annualRmseC - production.annualRmseC)).toBeLessThan(0.00001);
    }
    expect(result.cohorts[1]!.errors[0]!.monthlyRmseC).toBeCloseTo(3.57295, 5);
    for (const record of result.records) {
      expect(Math.abs(weightedMonthlyMean(record.frozen) - record.frozenAnnual)).toBeLessThan(0.00001);
      expect(Math.abs(weightedMonthlyMean(record.continuous) - record.continuousAnnual)).toBeLessThan(0.00001);
    }
  });
});
