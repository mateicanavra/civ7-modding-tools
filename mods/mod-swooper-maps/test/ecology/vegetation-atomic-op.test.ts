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
      config: {},
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

  it("is deterministic and seed-independent for exact ties", () => {
    const width = 1;
    const height = 1;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
      strategy: "default",
      config: {},
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
    const b = ecology.ops.planVegetation.run({ ...input, seed: 987654 }, selection);
    expect(b).toEqual(a);
  });

  it("uses feature-local admission thresholds before choosing the vegetation candidate", () => {
    const width = 1;
    const height = 2;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
      strategy: "default",
      config: {
        forestMinConfidence01: 0.2,
        rainforestMinConfidence01: 0.5,
        taigaMinConfidence01: 0.1,
        savannaWoodlandMinConfidence01: 0.1,
        sagebrushSteppeMinConfidence01: 0.05,
      },
    });

    const scoreForest01 = new Float32Array(size);
    const scoreRainforest01 = new Float32Array(size);
    const scoreTaiga01 = new Float32Array(size);
    const scoreSavannaWoodland01 = new Float32Array(size);
    const scoreSagebrushSteppe01 = new Float32Array(size);

    scoreRainforest01[0] = 0.4;
    scoreTaiga01[0] = 0.18;
    scoreForest01[1] = 0.18;
    scoreSagebrushSteppe01[1] = 0.07;

    const result = ecology.ops.planVegetation.run(
      {
        width,
        height,
        seed: 1,
        scoreForest01,
        scoreRainforest01,
        scoreTaiga01,
        scoreSavannaWoodland01,
        scoreSagebrushSteppe01,
        landMask: new Uint8Array(size).fill(1),
        featureIndex: new Uint16Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );

    expect(result.placements).toEqual([
      { x: 0, y: 0, feature: "FEATURE_TAIGA" },
      { x: 0, y: 1, feature: "FEATURE_SAGEBRUSH_STEPPE" },
    ]);
  });
});
