import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/router";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

describe("ecology floodplain planning", () => {
  it("maps the admitted grassland minor-river score to its feature identity", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.planFloodplains,
      ecology.features.ops.planFloodplains.defaultConfig
    );
    const result = ecology.features.ops.planFloodplains.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreDesertMinor01: new Float32Array(size),
        scoreDesertNavigable01: new Float32Array(size),
        scoreGrasslandMinor01: new Float32Array(size).fill(1),
        scoreGrasslandNavigable01: new Float32Array(size),
        scorePlainsMinor01: new Float32Array(size),
        scorePlainsNavigable01: new Float32Array(size),
        scoreTropicalMinor01: new Float32Array(size),
        scoreTropicalNavigable01: new Float32Array(size),
        scoreTundraMinor01: new Float32Array(size),
        scoreTundraNavigable01: new Float32Array(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );

    expect(result.placements.length).toBe(size);
    expect(result.placements[0]?.feature).toBe("grassland-floodplain-minor");
  });
});
