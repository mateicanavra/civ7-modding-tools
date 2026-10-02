import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import {
  measureStandardChannelEvolution,
  StandardChannelEvolutionMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/channel-evolution.js";

describe("certified channel evolution measurements", () => {
  const conservation = { residual: 0, roundoffBound: 1e-12 };
  it("keeps incision, rounding, and clamps distinct from published lowering", () => {
    const result = measureStandardChannelEvolution({
      initialElevation: Int16Array.of(8, 2, -5),
      finalElevation: Int16Array.of(6, 1, -5),
      incisionDepthByCycle: [[0.75, 0.6, 0], [1.4, 0.7, 0]],
      roundingDelta: [0.15, -0.7, 0],
      clampDelta: [0, 1, 0],
      conservationByCycle: [conservation, conservation],
      finalConservation: conservation,
    });
    expect(Value.Check(StandardChannelEvolutionMeasurementsSchema, result)).toBe(true);
    expect(result.cycleCount).toBe(2);
    expect(result.certifiedSolveCount).toBe(3);
    expect(result.incisionDepthTotal).toBeCloseTo(3.45, 12);
    expect(result.publishedLoweringTotal).toBe(3);
    expect(result.incisedCellCount).toBe(2);
    expect(result.publishedLoweredCellCount).toBe(2);
    expect(result.accountingErrorMax).toBeLessThan(1e-12);
    expect(result.waterConservationExcessMax).toBe(0);
  });
  it("represents the same certified solver's zero-evolution identity", () => {
    const result = measureStandardChannelEvolution({
      initialElevation: Int16Array.of(8, -5), finalElevation: Int16Array.of(8, -5),
      incisionDepthByCycle: [], roundingDelta: [0, 0], clampDelta: [0, 0],
      conservationByCycle: [], finalConservation: conservation,
    });
    expect(result).toEqual({
      version: 1, cycleCount: 0, certifiedSolveCount: 1, incisedCellCount: 0,
      publishedLoweredCellCount: 0, publishedRaisedCellCount: 0,
      incisionDepthTotal: 0, incisionDepthMax: 0, publishedLoweringTotal: 0,
      roundingDeltaTotal: 0, clampDeltaTotal: 0, accountingErrorMax: 0,
      waterConservationExcessMax: 0,
    });
  });
  it("refuses incomplete cycles and observes accounting failures without concealing them", () => {
    const input = {
      initialElevation: Int16Array.of(8), finalElevation: Int16Array.of(8),
      incisionDepthByCycle: [[1]], roundingDelta: [0], clampDelta: [0],
      conservationByCycle: [conservation], finalConservation: { residual: 0.2, roundoffBound: 0.1 },
    };
    expect(measureStandardChannelEvolution(input).accountingErrorMax).toBe(1);
    expect(measureStandardChannelEvolution(input).waterConservationExcessMax).toBe(0.1);
    expect(() => measureStandardChannelEvolution({ ...input, incisionDepthByCycle: [[]] })).toThrow("aligned");
    expect(() => measureStandardChannelEvolution({ ...input, conservationByCycle: [] })).toThrow("aligned");
  });
});
