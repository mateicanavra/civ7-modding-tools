import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

describe("ecology ice planning", () => {
  it("admits unoccupied ice at its configured confidence threshold", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const score01 = new Float32Array(size);
    const featureOccupancyMask = new Uint8Array(size);
    score01[0] = 0.49;
    score01[1] = 0.5;
    score01[2] = 1;
    featureOccupancyMask[2] = 1;

    const result = ecology.features.ops.planIce.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        externalWaterMask: new Uint8Array(size).fill(1),
        score01,
        featureOccupancyMask,
      },
      normalizeOperationSelectionForTest(ecology.features.ops.planIce, {
        strategy: "score-threshold",
        config: { minConfidence01: 0.5 },
      })
    );

    expect(result.placements).toEqual([{ x: 1, y: 0, feature: "ice" }]);
  });

  for (const minConfidence01 of [0, 0.5]) {
    it(`requires external-water eligibility independently of scores at threshold ${minConfidence01}`, () => {
      const input = {
        width: 4,
        height: 2,
        seed: TEST_MAP_SEED,
        externalWaterMask: Uint8Array.of(1, 1, 0, 0, 0, 0, 1, 2),
        // Cold/warm external, finite-water, and dry pairs; occupied and nonbinary cells follow.
        score01: Float32Array.of(1, 0, 1, 0, 1, 0, 1, 1),
        featureOccupancyMask: Uint8Array.of(0, 0, 0, 0, 0, 0, 1, 0),
      };
      const before = structuredClone(input);
      const result = ecology.features.ops.planIce.run(input,
        normalizeOperationSelectionForTest(ecology.features.ops.planIce, {
          strategy: "score-threshold", config: { minConfidence01 },
        }));

      expect(result.placements).toEqual(minConfidence01 === 0 ? [
        { x: 0, y: 0, feature: "ice" },
        { x: 1, y: 0, feature: "ice" },
      ] : [{ x: 0, y: 0, feature: "ice" }]);
      expect(input).toEqual(before);
    });
  }

  it("preserves its complete default threshold and refuses missing or malformed recipient evidence", () => {
    const planIce = ecology.features.ops.planIce;
    expect(planIce.defaultConfig).toEqual({
      strategy: "score-threshold", config: { minConfidence01: 0.5 },
    });
    const input = {
      width: 2, height: 1, seed: TEST_MAP_SEED,
      externalWaterMask: Uint8Array.of(1, 0),
      score01: Float32Array.of(0.5, 1),
      featureOccupancyMask: new Uint8Array(2),
    };
    const invalidInputs = [
      {
        width: input.width, height: input.height, seed: input.seed,
        score01: input.score01, featureOccupancyMask: input.featureOccupancyMask,
      },
      { ...input, externalWaterMask: new Float32Array(2) },
      { ...input, externalWaterMask: new Uint8Array(1) },
    ];
    for (const invalidInput of invalidInputs) {
      expect(() => Reflect.apply(planIce.run, undefined, [invalidInput, planIce.defaultConfig])).toThrow();
    }
    expect(planIce.run(input, planIce.defaultConfig).placements).toEqual([
      { x: 0, y: 0, feature: "ice" },
    ]);
  });
});
