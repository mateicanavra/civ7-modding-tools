import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { BIOME_SYMBOL_TO_INDEX } from "../../../src/domain/ecology/index.js";
import ecology from "../../../src/domain/ecology/router.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../setup.js";

describe("ecology rainforest moisture flow", () => {
  it("admits wet tropical habitat through real density, substrate, and scoring at a 0.29 floor", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const fertility = new Float32Array(size).fill(0.5);
    const biomes = ecology.biomes.ops.classifyBiomes.run(
      {
        width,
        height,
        landMask,
        effectiveMoisture: new Float32Array(size).fill(230),
        surfaceTemperatureC: new Float32Array(size).fill(26),
        aridityIndex: new Float32Array(size).fill(0.1),
        freezeIndex: new Float32Array(size).fill(0.05),
        soilType: new Uint8Array(size),
        fertility,
      },
      normalizeOperationSelectionForTest(
        ecology.biomes.ops.classifyBiomes,
        ecology.biomes.ops.classifyBiomes.defaultConfig
      )
    );
    const substrate = ecology.features.ops.computeVegetationSubstrate.run(
      {
        width,
        height,
        landMask,
        effectiveMoisture: biomes.effectiveMoisture,
        surfaceTemperature: biomes.surfaceTemperature,
        aridityIndex: biomes.aridityIndex,
        freezeIndex: biomes.freezeIndex,
        vegetationDensity: biomes.vegetationDensity,
        fertility,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.computeVegetationSubstrate,
        ecology.features.ops.computeVegetationSubstrate.defaultConfig
      )
    );
    const rainforest = ecology.features.ops.scoreVegetationRainforest.run(
      { width, height, landMask, ...substrate },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreVegetationRainforest,
        ecology.features.ops.scoreVegetationRainforest.defaultConfig
      )
    );
    const rainforestMinConfidence01 = 0.29;
    const vegetation = ecology.features.ops.planVegetation.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        landMask,
        flatLandMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
        biomeIndex: biomes.biomeIndex,
        surfaceTemperature: biomes.surfaceTemperature,
        effectiveMoisture: biomes.effectiveMoisture,
        aridityIndex: biomes.aridityIndex,
        vegetationDensity: biomes.vegetationDensity,
        scoreForest01: new Float32Array(size),
        scoreRainforest01: rainforest.score01,
        scoreTaiga01: new Float32Array(size),
        scoreSavannaWoodland01: new Float32Array(size),
        scoreSagebrushSteppe01: new Float32Array(size),
      },
      normalizeOperationSelectionForTest(ecology.features.ops.planVegetation, {
        ...ecology.features.ops.planVegetation.defaultConfig,
        config: {
          ...ecology.features.ops.planVegetation.defaultConfig.config,
          rainforestMinConfidence01,
        },
      })
    );

    expect(biomes.biomeIndex[0]).toBe(BIOME_SYMBOL_TO_INDEX.tropicalRainforest);
    expect(substrate.biomass01).toEqual(biomes.vegetationDensity);
    expect(substrate.water01[0]).toBe(1);
    expect(rainforest.score01[0]).toBeGreaterThan(rainforestMinConfidence01);
    expect(vegetation.placements).toHaveLength(size);
    expect(vegetation.placements.every((placement) => placement.feature === "rainforest")).toBe(true);
  });
});
