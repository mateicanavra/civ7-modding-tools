import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

describe("ecology floodplain planning", () => {
  it("selects the strongest admitted family above its threshold on an unoccupied tile", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.features.ops.planFloodplains, {
      strategy: "highest-confidence",
      config: { minConfidence01: 0.5 },
    });
    const scoreDesertMinor01 = new Float32Array(size);
    const scoreGrasslandMinor01 = new Float32Array(size);
    const scorePlainsNavigable01 = new Float32Array(size);
    const featureOccupancyMask = new Uint8Array(size);
    scoreDesertMinor01[0] = 0.49;
    scoreGrasslandMinor01[1] = 0.8;
    scorePlainsNavigable01[1] = 0.7;
    scorePlainsNavigable01[2] = 1;
    featureOccupancyMask[2] = 1;

    const result = ecology.features.ops.planFloodplains.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreDesertMinor01,
        scoreDesertNavigable01: new Float32Array(size),
        scoreGrasslandMinor01,
        scoreGrasslandNavigable01: new Float32Array(size),
        scorePlainsMinor01: new Float32Array(size),
        scorePlainsNavigable01,
        scoreTropicalMinor01: new Float32Array(size),
        scoreTropicalNavigable01: new Float32Array(size),
        scoreTundraMinor01: new Float32Array(size),
        scoreTundraNavigable01: new Float32Array(size),
        featureOccupancyMask,
      },
      selection
    );

    expect(result.placements).toEqual([{ x: 1, y: 0, feature: "grassland-floodplain-minor" }]);
  });
});
