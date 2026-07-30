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
});
