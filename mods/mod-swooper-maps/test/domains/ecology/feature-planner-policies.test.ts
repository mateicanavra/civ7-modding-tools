import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { Value } from "typebox/value";
import { normalizeOpSelectionOrThrow } from "../../support/compiler-helpers.js";

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

describe("ecology feature planner policies", () => {
  it("rejects weak positive scores across all feature-family planners", () => {
    const width = 1;
    const height = 1;
    const size = width * height;
    const weakPositive = 0.05;

    const reefs = ecology.ops.planReefs.run(
      {
        width,
        height,
        seed: 1,
        scoreReef01: f32(size, weakPositive),
        scoreColdReef01: f32(size, weakPositive),
        scoreAtoll01: f32(size, weakPositive),
        scoreLotus01: f32(size, weakPositive),
        lakeMask: new Uint8Array(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planReefs, ecology.ops.planReefs.defaultConfig)
    );

    const wetlands = ecology.ops.planWetlands.run(
      {
        width,
        height,
        seed: 1,
        scoreMarsh01: f32(size, weakPositive),
        scoreTundraBog01: f32(size, weakPositive),
        scoreMangrove01: f32(size, weakPositive),
        scoreOasis01: f32(size, weakPositive),
        scoreWateringHole01: f32(size, weakPositive),
        flatLandMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planWetlands, ecology.ops.planWetlands.defaultConfig)
    );

    const vegetation = ecology.ops.planVegetation.run(
      {
        width,
        height,
        seed: 1,
        scoreForest01: f32(size, weakPositive),
        scoreRainforest01: f32(size, weakPositive),
        scoreTaiga01: f32(size, weakPositive),
        scoreSavannaWoodland01: f32(size, weakPositive),
        scoreSagebrushSteppe01: f32(size, weakPositive),
        landMask: new Uint8Array(size).fill(1),
        ...broadVegetationHabitatFields(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(
        ecology.ops.planVegetation,
        ecology.ops.planVegetation.defaultConfig
      )
    );

    const ice = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1,
        score01: f32(size, weakPositive),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planIce, ecology.ops.planIce.defaultConfig)
    );

    const continentalIce = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1,
        score01: f32(size, weakPositive),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planIce, {
        strategy: "continentality",
        config: Value.Create(ecology.ops.planIce.strategies.continentality.config),
      })
    );

    expect(reefs.placements).toEqual([]);
    expect(wetlands.placements).toEqual([]);
    expect(vegetation.placements).toEqual([]);
    expect(ice.placements).toEqual([]);
    expect(continentalIce.placements).toEqual([]);
  });
});
