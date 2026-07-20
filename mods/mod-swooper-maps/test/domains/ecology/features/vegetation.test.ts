import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";

import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";

function broadHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
    biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
    surfaceTemperature: new Float32Array(size).fill(20),
    effectiveMoisture: new Float32Array(size).fill(120),
    aridityIndex: new Float32Array(size).fill(0.4),
    vegetationDensity: new Float32Array(size).fill(0.35),
  };
}

describe("planVegetation (joint resolver)", () => {
  it("selects the highest-scoring vegetation feature per land tile and respects occupancy", () => {
    const syntheticDimensions = { width: 2, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.ops.planVegetation,
      ecology.ops.planVegetation.defaultConfig
    );

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
    const habitat = broadHabitatFields(size);
    habitat.biomeIndex[1] = BIOME_SYMBOL_TO_INDEX.boreal;
    habitat.surfaceTemperature[1] = 2;
    habitat.biomeIndex[2] = BIOME_SYMBOL_TO_INDEX.tropicalRainforest;
    habitat.surfaceTemperature[2] = 25;
    habitat.effectiveMoisture[2] = 120;
    habitat.vegetationDensity[2] = 0.45;
    habitat.biomeIndex[3] = BIOME_SYMBOL_TO_INDEX.desert;
    habitat.surfaceTemperature[3] = 20;
    habitat.vegetationDensity[3] = 0.2;
    const featureOccupancyMask = new Uint8Array(size);
    featureOccupancyMask[2] = 1;
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
        ...habitat,
        featureOccupancyMask,
        reserved,
      },
      selection
    );

    expect(result.placements.map((p) => p.feature)).toEqual(["forest", "taiga"]);
  });

  it("is deterministic and seed-independent for exact ties", () => {
    const syntheticDimensions = { width: 1, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.ops.planVegetation,
      ecology.ops.planVegetation.defaultConfig
    );

    const input = {
      width,
      height,
      scoreForest01: new Float32Array(size).fill(1),
      scoreRainforest01: new Float32Array(size).fill(1),
      scoreTaiga01: new Float32Array(size).fill(1),
      scoreSavannaWoodland01: new Float32Array(size).fill(1),
      scoreSagebrushSteppe01: new Float32Array(size).fill(1),
      landMask: new Uint8Array(size).fill(1),
      ...broadHabitatFields(size),
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    } as const;

    const a = ecology.ops.planVegetation.run({ ...input, seed: 123 }, selection);
    const b = ecology.ops.planVegetation.run({ ...input, seed: 987654 }, selection);
    expect(b).toEqual(a);
  });

  it("uses feature-local admission thresholds before choosing the vegetation candidate", () => {
    const syntheticDimensions = { width: 1, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.ops.planVegetation, {
      ...ecology.ops.planVegetation.defaultConfig,
      config: {
        ...ecology.ops.planVegetation.defaultConfig.config,
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
    scoreTaiga01[1] = 0.18;
    scoreForest01[2] = 0.18;
    scoreSagebrushSteppe01[2] = 0.07;
    const habitat = broadHabitatFields(size);
    habitat.biomeIndex[0] = BIOME_SYMBOL_TO_INDEX.tropicalRainforest;
    habitat.surfaceTemperature[0] = 25;
    habitat.effectiveMoisture[0] = 120;
    habitat.vegetationDensity[0] = 0.45;
    habitat.biomeIndex[1] = BIOME_SYMBOL_TO_INDEX.boreal;
    habitat.surfaceTemperature[1] = 0;
    habitat.biomeIndex[2] = BIOME_SYMBOL_TO_INDEX.desert;
    habitat.surfaceTemperature[2] = 18;
    habitat.vegetationDensity[2] = 0.2;

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
        ...habitat,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );

    expect(result.placements).toEqual([
      { x: 0, y: 1, feature: "taiga" },
      { x: 0, y: 2, feature: "sagebrush-steppe" },
    ]);
  });

  it("rejects vegetation candidates outside the broad feature habitat envelope", () => {
    const syntheticDimensions = { width: 1, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.ops.planVegetation, {
      ...ecology.ops.planVegetation.defaultConfig,
      config: {
        ...ecology.ops.planVegetation.defaultConfig.config,
        forestMinConfidence01: 0,
        rainforestMinConfidence01: 0,
        taigaMinConfidence01: 0,
        savannaWoodlandMinConfidence01: 0,
        sagebrushSteppeMinConfidence01: 0,
      },
    });

    const scoreSagebrushSteppe01 = new Float32Array(size).fill(1);
    const habitat = broadHabitatFields(size);
    habitat.biomeIndex.fill(BIOME_SYMBOL_TO_INDEX.desert);
    habitat.surfaceTemperature[0] = 38;
    habitat.surfaceTemperature[1] = 22;
    habitat.vegetationDensity.fill(0.2);

    const result = ecology.ops.planVegetation.run(
      {
        width,
        height,
        seed: 1,
        scoreForest01: new Float32Array(size),
        scoreRainforest01: new Float32Array(size),
        scoreTaiga01: new Float32Array(size),
        scoreSavannaWoodland01: new Float32Array(size),
        scoreSagebrushSteppe01,
        landMask: new Uint8Array(size).fill(1),
        ...habitat,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      selection
    );

    expect(result.placements).toEqual([{ x: 0, y: 1, feature: "sagebrush-steppe" }]);
  });
});
