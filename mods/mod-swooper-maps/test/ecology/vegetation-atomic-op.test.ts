import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

describe("planVegetation (joint resolver)", () => {
  it("selects the highest-scoring vegetation feature per land tile and respects occupancy", () => {
    const width = 2;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
      strategy: "default",
      config: { minScore01: 0.15 },
    });

    const scoreForest01 = new Float32Array(size);
    const scoreRainforest01 = new Float32Array(size);
    const scoreTaiga01 = new Float32Array(size);
    const scoreSavannaWoodland01 = new Float32Array(size);
    const scoreSagebrushSteppe01 = new Float32Array(size);

    // tileIndex 0 -> forest
    scoreForest01[0] = 1;
    // tileIndex 1 -> taiga
    scoreTaiga01[1] = 1;
    // tileIndex 2 -> rainforest (but occupied should block it)
    scoreRainforest01[2] = 1;
    // tileIndex 3 -> steppe (but reserved should block it)
    scoreSagebrushSteppe01[3] = 1;

    const landMask = new Uint8Array(size).fill(1);
    const featureIndex = new Uint16Array(size);
    featureIndex[2] = 1;
    const reserved = new Uint8Array(size);
    reserved[3] = 1;

    const result = ecology.ops.planVegetation.run(
      {
        width,
        height,
        seed: 1337,
        scoreForest01,
        scoreRainforest01,
        scoreTaiga01,
        scoreSavannaWoodland01,
        scoreSagebrushSteppe01,
        landMask,
        featureIndex,
        reserved,
      },
      selection
    );

    expect(result.placements.map((p) => p.feature)).toEqual(["FEATURE_FOREST", "FEATURE_TAIGA"]);
  });

  it("uses the seed only to break exact ties deterministically", () => {
    const width = 1;
    const height = 1;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
      strategy: "default",
      config: { minScore01: 0.15 },
    });

    const input = {
      width,
      height,
      scoreForest01: new Float32Array(size).fill(1),
      scoreRainforest01: new Float32Array(size).fill(1),
      scoreTaiga01: new Float32Array(size).fill(1),
      scoreSavannaWoodland01: new Float32Array(size).fill(1),
      scoreSagebrushSteppe01: new Float32Array(size).fill(1),
      landMask: new Uint8Array(size).fill(1),
      featureIndex: new Uint16Array(size),
      reserved: new Uint8Array(size),
    } as const;

    const a = ecology.ops.planVegetation.run({ ...input, seed: 123 }, selection);
    const b = ecology.ops.planVegetation.run({ ...input, seed: 123 }, selection);
    expect(b).toEqual(a);
  });
});

