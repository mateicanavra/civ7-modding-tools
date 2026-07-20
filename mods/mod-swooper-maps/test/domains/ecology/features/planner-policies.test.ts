import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";

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
    const syntheticDimensions = { width: 1, height: 1 } as const;
    const { width, height } = syntheticDimensions;
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
      normalizeOperationSelectionForTest(ecology.ops.planReefs, ecology.ops.planReefs.defaultConfig)
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
      normalizeOperationSelectionForTest(
        ecology.ops.planWetlands,
        ecology.ops.planWetlands.defaultConfig
      )
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
      normalizeOperationSelectionForTest(
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
      normalizeOperationSelectionForTest(ecology.ops.planIce, ecology.ops.planIce.defaultConfig)
    );

    expect(reefs.placements).toEqual([]);
    expect(wetlands.placements).toEqual([]);
    expect(vegetation.placements).toEqual([]);
    expect(ice.placements).toEqual([]);
  });

  it("keeps diagonal-stride lotus intent on lake tiles", () => {
    const syntheticDimensions = { width: 3, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.ops.planReefs, {
      strategy: "diagonal-stride",
      config: { minConfidence01: 0.5, stride: 1 },
    });
    const input = {
      width,
      height,
      seed: 1,
      scoreReef01: f32(size, 0),
      scoreColdReef01: f32(size, 0),
      scoreAtoll01: f32(size, 0),
      scoreLotus01: f32(size, 1),
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    };

    const withoutLakes = ecology.ops.planReefs.run(
      { ...input, lakeMask: new Uint8Array(size) },
      selection
    );
    const withLakes = ecology.ops.planReefs.run(
      { ...input, lakeMask: new Uint8Array(size).fill(1) },
      selection
    );

    expect(withoutLakes.placements).toEqual([]);
    expect(withLakes.placements.map(({ feature }) => feature)).toEqual(["lotus", "lotus", "lotus"]);
  });

  it("uses one authored stride for the diagonal pattern", () => {
    const syntheticDimensions = { width: 6, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const result = ecology.ops.planReefs.run(
      {
        width,
        height,
        seed: 1,
        scoreReef01: f32(size, 1),
        scoreColdReef01: f32(size, 0),
        scoreAtoll01: f32(size, 0),
        scoreLotus01: f32(size, 0),
        lakeMask: new Uint8Array(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(ecology.ops.planReefs, {
        strategy: "diagonal-stride",
        config: { minConfidence01: 0.5, stride: 2 },
      })
    );

    expect(result.placements.map(({ x }) => x)).toEqual([0, 2, 4]);
  });
});
