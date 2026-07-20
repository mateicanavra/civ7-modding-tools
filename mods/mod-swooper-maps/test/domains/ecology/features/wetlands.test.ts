import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";

function broadWetlandHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
  };
}

describe("planWetlands (joint resolver)", () => {
  it("selects the highest-scoring wet feature per tile and respects occupancy", () => {
    const syntheticDimensions = { width: 2, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.ops.planWetlands,
      ecology.ops.planWetlands.defaultConfig
    );

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
    // tileIndex 3 -> mangrove (but reserved should block it)
    scoreMangrove01[3] = 1;

    const featureOccupancyMask = new Uint8Array(size);
    const reserved = new Uint8Array(size);
    reserved[3] = 1;
    const habitat = broadWetlandHabitatFields(size);

    const result = ecology.ops.planWetlands.run(
      {
        width,
        height,
        seed: 1337,
        scoreMarsh01,
        scoreTundraBog01,
        scoreMangrove01,
        scoreOasis01,
        scoreWateringHole01,
        ...habitat,
        featureOccupancyMask,
        reserved,
      },
      selection
    );

    expect(result.placements.map((p) => p.feature)).toEqual(["marsh", "oasis", "tundra-bog"]);
  });

  it("is deterministic and seed-independent for exact ties", () => {
    const syntheticDimensions = { width: 1, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.ops.planWetlands,
      ecology.ops.planWetlands.defaultConfig
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
      reserved: new Uint8Array(size),
    } as const;

    const a = ecology.ops.planWetlands.run({ ...input, seed: 123 }, selection);
    const b = ecology.ops.planWetlands.run({ ...input, seed: 987654 }, selection);
    expect(b).toEqual(a);
  });
});
