import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

describe("planWetlands (joint resolver)", () => {
  it("selects the highest-scoring wet feature per tile and respects occupancy", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetlands, {
      strategy: "default",
      config: {},
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
    // tileIndex 3 -> mangrove (but reserved should block it)
    scoreMangrove01[3] = 1;

    const featureIndex = new Uint16Array(size);
    const reserved = new Uint8Array(size);
    reserved[3] = 1;

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
        featureIndex,
        reserved,
      },
      selection
    );

    expect(result.placements.map((p) => p.feature)).toEqual([
      "FEATURE_MARSH",
      "FEATURE_OASIS",
      "FEATURE_TUNDRA_BOG",
    ]);
  });

  it("is deterministic and seed-independent for exact ties", () => {
    const width = 1;
    const height = 1;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planWetlands, {
      strategy: "default",
      config: {},
    });

    const input = {
      width,
      height,
      scoreMarsh01: new Float32Array(size).fill(1),
      scoreTundraBog01: new Float32Array(size).fill(1),
      scoreMangrove01: new Float32Array(size).fill(1),
      scoreOasis01: new Float32Array(size).fill(1),
      scoreWateringHole01: new Float32Array(size).fill(1),
      featureIndex: new Uint16Array(size),
      reserved: new Uint8Array(size),
    } as const;

    const a = ecology.ops.planWetlands.run({ ...input, seed: 123 }, selection);
    const b = ecology.ops.planWetlands.run({ ...input, seed: 987654 }, selection);
    expect(b).toEqual(a);
  });
});
