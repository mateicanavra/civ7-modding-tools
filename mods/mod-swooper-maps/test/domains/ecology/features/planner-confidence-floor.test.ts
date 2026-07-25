import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/router";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

function f32(size: number, value: number): Float32Array {
  return new Float32Array(size).fill(value);
}

function broadVegetationHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
    biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
    surfaceTemperature: f32(size, 20),
    effectiveMoisture: f32(size, 120),
    aridityIndex: f32(size, 0.4),
    vegetationDensity: f32(size, 0.35),
  };
}

describe("ecology feature planner confidence floor", () => {
  it("rejects weak positive scores across every feature-family planner", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const weakPositive = 0.05;

    const reefs = ecology.features.ops.planReefs.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreReef01: f32(size, weakPositive),
        scoreColdReef01: f32(size, weakPositive),
        scoreAtoll01: f32(size, weakPositive),
        scoreLotus01: f32(size, weakPositive),
        lakeMask: new Uint8Array(size),
        featureOccupancyMask: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.planReefs,
        ecology.features.ops.planReefs.defaultConfig
      )
    );

    const wetlands = ecology.features.ops.planWetlands.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreMarsh01: f32(size, weakPositive),
        scoreTundraBog01: f32(size, weakPositive),
        scoreMangrove01: f32(size, weakPositive),
        scoreOasis01: f32(size, weakPositive),
        scoreWateringHole01: f32(size, weakPositive),
        flatLandMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.planWetlands,
        ecology.features.ops.planWetlands.defaultConfig
      )
    );

    const vegetation = ecology.features.ops.planVegetation.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreForest01: f32(size, weakPositive),
        scoreRainforest01: f32(size, weakPositive),
        scoreTaiga01: f32(size, weakPositive),
        scoreSavannaWoodland01: f32(size, weakPositive),
        scoreSagebrushSteppe01: f32(size, weakPositive),
        landMask: new Uint8Array(size).fill(1),
        ...broadVegetationHabitatFields(size),
        featureOccupancyMask: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.planVegetation,
        ecology.features.ops.planVegetation.defaultConfig
      )
    );

    const ice = ecology.features.ops.planIce.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        score01: f32(size, weakPositive),
        featureOccupancyMask: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.planIce,
        ecology.features.ops.planIce.defaultConfig
      )
    );

    expect(reefs.placements).toEqual([]);
    expect(wetlands.placements).toEqual([]);
    expect(vegetation.placements).toEqual([]);
    expect(ice.placements).toEqual([]);
  });
});
