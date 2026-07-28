import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";

import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

function broadWetlandHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
  };
}

describe("planWetlands (joint resolver)", () => {
  it("selects wetland families above the configured threshold on unoccupied tiles", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.features.ops.planWetlands, {
      strategy: "habitat-confidence",
      config: { minConfidence01: 0.5 },
    });

    const scoreMarsh01 = new Float32Array(size);
    const scoreTundraBog01 = new Float32Array(size);
    const scoreMangrove01 = new Float32Array(size);
    const scoreOasis01 = new Float32Array(size);
    const scoreWateringHole01 = new Float32Array(size);

    // tileIndex 0 -> marsh
    scoreMarsh01[0] = 1;
    // tileIndex 1 -> oasis
    scoreOasis01[1] = 1;
    // tileIndex 2 -> bog
    scoreTundraBog01[2] = 1;
    // tileIndex 3 -> mangrove
    scoreMangrove01[3] = 1;
    // tileIndex 4 -> watering hole below the configured confidence floor
    scoreWateringHole01[4] = 0.49;

    const featureOccupancyMask = new Uint8Array(size);
    featureOccupancyMask[3] = 1;
    const habitat = broadWetlandHabitatFields(size);

    const result = ecology.features.ops.planWetlands.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreMarsh01,
        scoreTundraBog01,
        scoreMangrove01,
        scoreOasis01,
        scoreWateringHole01,
        ...habitat,
        featureOccupancyMask,
      },
      selection
    );

    expect(result.placements.map((p) => p.feature)).toEqual(["marsh", "oasis", "tundra-bog"]);
  });

  it("is deterministic and seed-independent for exact ties", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.planWetlands,
      ecology.features.ops.planWetlands.defaultConfig
    );

    const input = {
      width,
      height,
      scoreMarsh01: new Float32Array(size).fill(1),
      scoreTundraBog01: new Float32Array(size).fill(1),
      scoreMangrove01: new Float32Array(size).fill(1),
      scoreOasis01: new Float32Array(size).fill(1),
      scoreWateringHole01: new Float32Array(size).fill(1),
      ...broadWetlandHabitatFields(size),
      featureOccupancyMask: new Uint8Array(size),
    } as const;

    const a = ecology.features.ops.planWetlands.run({ ...input, seed: 123 }, selection);
    const b = ecology.features.ops.planWetlands.run({ ...input, seed: 987654 }, selection);
    expect(b).toEqual(a);
  });
});
