import { describe, expect, it } from "bun:test";
import ecology from "../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../src/domain/ecology/index.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology vegetation moisture flow", () => {
  it("carries Hydrology-scale effective moisture into a viable unsaturated forest score", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const effectiveMoisture = 120;
    const substrate = ecology.features.ops.computeVegetationSubstrate.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        effectiveMoisture: new Float32Array(size).fill(effectiveMoisture),
        surfaceTemperature: new Float32Array(size).fill(20),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
        vegetationDensity: new Float32Array(size).fill(0.6),
        fertility: new Float32Array(size).fill(0.5),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.computeVegetationSubstrate,
        ecology.features.ops.computeVegetationSubstrate.defaultConfig
      )
    );

    const forest = ecology.features.ops.scoreVegetationForest.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        ...substrate,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreVegetationForest,
        ecology.features.ops.scoreVegetationForest.defaultConfig
      )
    );

    expect(substrate.water01[0]).toBeCloseTo(effectiveMoisture / 230, 6);
    expect(forest.score01[0]).toBeGreaterThan(0);
    expect(forest.score01[0]).toBeLessThan(1);
  });

  it("keeps wet temperate habitat viable through classification, substrate, scoring, and unchanged planner gates", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    for (const moistureNormalization of [230, 238]) {
      let previousScore = 0;
      for (const effectiveMoisture of [188, 214.2, 238, 300]) {
        const landMask = new Uint8Array(size).fill(1);
        landMask[0] = 0;
        const fertility = new Float32Array(size).fill(0.6);
        const biomes = ecology.biomes.ops.classifyBiomes.run(
          {
            width,
            height,
            landMask,
            effectiveMoisture: new Float32Array(size).fill(effectiveMoisture),
            surfaceTemperatureC: new Float32Array(size).fill(20),
            aridityIndex: new Float32Array(size).fill(0.1),
            freezeIndex: new Float32Array(size).fill(0.05),
            permafrost01: new Float32Array(size),
            soilType: new Uint8Array(size).fill(2),
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
          normalizeOperationSelectionForTest(ecology.features.ops.computeVegetationSubstrate, {
            ...ecology.features.ops.computeVegetationSubstrate.defaultConfig,
            config: {
              ...ecology.features.ops.computeVegetationSubstrate.defaultConfig.config,
              moistureNormalization,
            },
          })
        );
        const forest = ecology.features.ops.scoreVegetationForest.run(
          { width, height, landMask, ...substrate },
          normalizeOperationSelectionForTest(
            ecology.features.ops.scoreVegetationForest,
            ecology.features.ops.scoreVegetationForest.defaultConfig
          )
        );
        const rainforest = ecology.features.ops.scoreVegetationRainforest.run(
          { width, height, landMask, ...substrate },
          normalizeOperationSelectionForTest(
            ecology.features.ops.scoreVegetationRainforest,
            ecology.features.ops.scoreVegetationRainforest.defaultConfig
          )
        );
        const flatLandMask = new Uint8Array(size).fill(1);
        flatLandMask[1] = 0;
        const featureOccupancyMask = new Uint8Array(size);
        featureOccupancyMask[2] = 1;
        const vegetation = ecology.features.ops.planVegetation.run(
          {
            width,
            height,
            seed: TEST_MAP_SEED,
            landMask,
            flatLandMask,
            featureOccupancyMask,
            biomeIndex: biomes.biomeIndex,
            surfaceTemperature: biomes.surfaceTemperature,
            effectiveMoisture: biomes.effectiveMoisture,
            aridityIndex: biomes.aridityIndex,
            vegetationDensity: biomes.vegetationDensity,
            scoreForest01: forest.score01,
            scoreRainforest01: rainforest.score01,
            scoreTaiga01: new Float32Array(size),
            scoreSavannaWoodland01: new Float32Array(size),
            scoreSagebrushSteppe01: new Float32Array(size),
          },
          normalizeOperationSelectionForTest(
            ecology.features.ops.planVegetation,
            ecology.features.ops.planVegetation.defaultConfig
          )
        );

        expect(biomes.biomeIndex[3]).toBe(BIOME_SYMBOL_TO_INDEX.temperateHumid);
        expect(substrate.biomass01).toEqual(biomes.vegetationDensity);
        expect(substrate.water01[3]).toBeCloseTo(Math.min(1, effectiveMoisture / moistureNormalization), 6);
        expect(forest.score01[0]).toBe(0);
        expect(forest.score01[3]).toBeGreaterThanOrEqual(previousScore);
        expect(forest.score01[3]).toBeGreaterThan(
          ecology.features.ops.planVegetation.defaultConfig.config.forestMinConfidence01
        );
        expect(rainforest.score01[3]).toBeGreaterThan(0);
        expect(vegetation.placements).toHaveLength(size - 3);
        expect(vegetation.placements.every((placement) => placement.feature === "forest")).toBe(true);
        expect(vegetation.placements.every((placement) => placement.y * width + placement.x > 2)).toBe(true);
        previousScore = forest.score01[3]!;
      }
    }
  });
});
