import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { deriveFeatureOccupancy } from "../../../../../../src/recipes/standard/stages/ecology/features/model/policy/derive-feature-occupancy.js";
import { deriveWetlandTerrainBiomeCompatibilityMasks } from "../../../../../../src/recipes/standard/stages/ecology/model/policy/wetland-terrain-biome-compatibility.js";

import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

function broadWetlandHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
    terrainBiomeCompatibilityMasks: {
      marsh: new Uint8Array(size).fill(1),
      "tundra-bog": new Uint8Array(size).fill(1),
      mangrove: new Uint8Array(size).fill(1),
      oasis: new Uint8Array(size).fill(1),
      "watering-hole": new Uint8Array(size).fill(1),
    },
  };
}

describe("planWetlands (joint resolver)", () => {
  it("selects wetland families above the configured threshold on unoccupied tiles", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.features.ops.planWetlands, {
      strategy: "habitat-confidence",
      config: { minConfidence01: 0.5 },
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
    // tileIndex 3 -> mangrove
    scoreMangrove01[3] = 1;
    // tileIndex 4 -> watering hole below the configured confidence floor
    scoreWateringHole01[4] = 0.49;

    const featureOccupancyMask = new Uint8Array(size);
    featureOccupancyMask[3] = 1;
    const habitat = broadWetlandHabitatFields(size);

    const result = ecology.features.ops.planWetlands.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreMarsh01,
        scoreTundraBog01,
        scoreMangrove01,
        scoreOasis01,
        scoreWateringHole01,
        ...habitat,
        featureOccupancyMask,
      },
      selection
    );

    expect(result.placements.map((p) => p.feature)).toEqual(["marsh", "oasis", "tundra-bog"]);
  });

  it("is deterministic and seed-independent for exact ties", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.planWetlands,
      ecology.features.ops.planWetlands.defaultConfig
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
    } as const;

    const a = ecology.features.ops.planWetlands.run({ ...input, seed: 123 }, selection);
    const b = ecology.features.ops.planWetlands.run({ ...input, seed: 987654 }, selection);
    expect(b).toEqual(a);
  });

  it("requires closed masks and selects a legal runner-up before reserving intent", () => {
    const width = 3;
    const height = 1;
    const flatLandMask = new Uint8Array(width).fill(1);
    const habitat = {
      flatLandMask,
      terrainBiomeCompatibilityMasks: deriveWetlandTerrainBiomeCompatibilityMasks({
        width,
        height,
        flatLandMask,
        biomeIndex: new Uint8Array([
          BIOME_SYMBOL_TO_INDEX.temperateHumid,
          BIOME_SYMBOL_TO_INDEX.desert,
          BIOME_SYMBOL_TO_INDEX.tropicalRainforest,
        ]),
      }),
    };
    const masks = habitat.terrainBiomeCompatibilityMasks;
    const input = {
      width,
      height,
      seed: TEST_MAP_SEED,
      scoreMarsh01: new Float32Array([0.75, 0.75, 0.75]),
      scoreTundraBog01: new Float32Array(width),
      scoreMangrove01: new Float32Array([0.95, 0.95, 0.95]),
      scoreOasis01: new Float32Array(width),
      scoreWateringHole01: new Float32Array(width),
      ...habitat,
      featureOccupancyMask: new Uint8Array(width),
    };
    const planner = ecology.features.ops.planWetlands;
    const selection = normalizeOperationSelectionForTest(planner, planner.defaultConfig);
    const before = structuredClone(input);

    expect(Value.Check(planner.input, input)).toBe(true);
    expect(
      Value.Check(planner.input, { ...input, terrainBiomeCompatibilityMasks: undefined })
    ).toBe(false);
    expect(
      Value.Check(planner.input, {
        ...input,
        terrainBiomeCompatibilityMasks: { marsh: masks.marsh },
      })
    ).toBe(false);
    expect(
      Value.Check(planner.input, {
        ...input,
        terrainBiomeCompatibilityMasks: { ...masks, reef: new Uint8Array(width) },
      })
    ).toBe(false);
    expect(() =>
      planner.run(
        {
          ...input,
          terrainBiomeCompatibilityMasks: { ...masks, mangrove: new Uint8Array(width - 1) },
        },
        selection
      )
    ).toThrow();
    expect(planner.run(input, selection).placements).toEqual([
      { x: 0, y: 0, feature: "marsh" },
      { x: 2, y: 0, feature: "mangrove" },
    ]);
    expect(input).toEqual(before);
  });

  it("leaves unsupported desert and plains mangrove claims available to vegetation", () => {
    const width = 2;
    const height = 1;
    const flatLandMask = new Uint8Array(width).fill(1);
    const biomeIndex = new Uint8Array([
      BIOME_SYMBOL_TO_INDEX.desert,
      BIOME_SYMBOL_TO_INDEX.tropicalSeasonal,
    ]);
    const planner = ecology.features.ops.planWetlands;
    const wetlandIntents = planner.run({
      width,
      height,
      seed: TEST_MAP_SEED,
      scoreMarsh01: new Float32Array(width),
      scoreTundraBog01: new Float32Array(width),
      scoreMangrove01: new Float32Array(width).fill(0.95),
      scoreOasis01: new Float32Array(width),
      scoreWateringHole01: new Float32Array(width),
      flatLandMask,
      terrainBiomeCompatibilityMasks: deriveWetlandTerrainBiomeCompatibilityMasks({
        width,
        height,
        flatLandMask,
        biomeIndex,
      }),
      featureOccupancyMask: new Uint8Array(width),
    }, normalizeOperationSelectionForTest(planner, planner.defaultConfig)).placements;
    expect(wetlandIntents).toEqual([]);

    const vegetation = ecology.features.ops.planVegetation;
    const vegetationIntents = vegetation.run({
      width,
      height,
      seed: TEST_MAP_SEED,
      scoreForest01: new Float32Array(width),
      scoreRainforest01: new Float32Array(width),
      scoreTaiga01: new Float32Array(width),
      scoreSavannaWoodland01: new Float32Array([0, 0.8]),
      scoreSagebrushSteppe01: new Float32Array([0.8, 0]),
      landMask: new Uint8Array(width).fill(1),
      flatLandMask,
      biomeIndex,
      surfaceTemperature: new Float32Array(width).fill(24),
      plantEffectiveMoisture: new Float32Array(width).fill(80),
      climaticAridityIndex: new Float32Array(width).fill(0.5),
      vegetationDensity: new Float32Array(width).fill(0.3),
      featureOccupancyMask: deriveFeatureOccupancy({ width, height }, wetlandIntents),
    }, normalizeOperationSelectionForTest(vegetation, vegetation.defaultConfig)).placements;
    expect(vegetationIntents).toEqual([
      { x: 0, y: 0, feature: "sagebrush-steppe" },
      { x: 1, y: 0, feature: "savanna-woodland" },
    ]);
  });
});
