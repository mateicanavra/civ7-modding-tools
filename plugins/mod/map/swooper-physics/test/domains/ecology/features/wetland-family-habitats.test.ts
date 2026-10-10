import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../src/domain/ecology/index.js";
import ecology from "../../../../src/domain/ecology/router.js";
import { deriveWetlandTerrainBiomeCompatibilityMasks } from "../../../../src/recipes/standard/stages/ecology/model/policy/wetland-terrain-biome-compatibility.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology wetland-family habitats", () => {
  it("requires hydromorphic, intertidal, or isolated water-source substrate", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const hydromorphicMask = new Uint8Array(size);
    hydromorphicMask[1] = 1;
    const intertidalCoastMask = new Uint8Array(size);
    intertidalCoastMask[1] = 1;
    const isolatedWaterPointMask = new Uint8Array(size);
    isolatedWaterPointMask[1] = 1;
    const water01 = new Float32Array(size).fill(0.85);
    const fertility01 = new Float32Array(size).fill(0.7);
    const surfaceTemperature = new Float32Array(size).fill(14);
    const mangroveTemperature = new Float32Array(size).fill(24);
    const coldTemperature = new Float32Array(size);
    const aridityIndex = new Float32Array(size).fill(0.25);
    const dryAridityIndex = new Float32Array(size).fill(0.8);
    const aridWaterPointWater01 = new Float32Array(size).fill(0.7);
    const freezeIndex = new Float32Array(size).fill(0.8);

    const marsh = ecology.features.ops.scoreWetMarsh.run(
      {
        width,
        height,
        landMask,
        hydromorphicMask,
        water01,
        fertility01,
        surfaceTemperature,
        aridityIndex,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetMarsh,
        ecology.features.ops.scoreWetMarsh.defaultConfig
      )
    ).score01;
    const bog = ecology.features.ops.scoreWetTundraBog.run(
      {
        width,
        height,
        landMask,
        hydromorphicMask,
        water01,
        fertility01,
        surfaceTemperature: coldTemperature,
        freezeIndex,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetTundraBog,
        ecology.features.ops.scoreWetTundraBog.defaultConfig
      )
    ).score01;
    const mangrove = ecology.features.ops.scoreWetMangrove.run(
      {
        width,
        height,
        landMask,
        intertidalCoastMask,
        fertility01,
        surfaceTemperature: mangroveTemperature,
        aridityIndex,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetMangrove,
        ecology.features.ops.scoreWetMangrove.defaultConfig
      )
    ).score01;
    const oasis = ecology.features.ops.scoreWetOasis.run(
      {
        width,
        height,
        landMask,
        isolatedWaterPointMask,
        water01: aridWaterPointWater01,
        aridityIndex: dryAridityIndex,
        surfaceTemperature: mangroveTemperature,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreWetOasis,
        ecology.features.ops.scoreWetOasis.defaultConfig
      )
    ).score01;

    expect(marsh[0]).toBe(0);
    expect(marsh[1]).toBeGreaterThan(0.2);
    expect(bog[0]).toBe(0);
    expect(bog[1]).toBeGreaterThan(0.2);
    expect(mangrove[0]).toBe(0);
    expect(mangrove[1]).toBeGreaterThan(0.2);
    expect(oasis[0]).toBe(0);
    expect(oasis[1]).toBeGreaterThan(0.05);
  });

  it("scores marine mangrove response without terrestrial water and retains planner admission gates", () => {
    const width = 10;
    const height = 1;
    const size = width * height;
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      intertidalCoastMask: new Uint8Array(size).fill(1),
      fertility01: new Float32Array(size).fill(0.6),
      surfaceTemperature: new Float32Array(size).fill(30),
      aridityIndex: new Float32Array(size).fill(0.4),
    };
    input.surfaceTemperature[1] = 24;
    input.aridityIndex[2] = 0.85;
    input.surfaceTemperature[3] = 18;
    input.aridityIndex[4] = 1;
    input.intertidalCoastMask[5] = 0;
    input.landMask[6] = 0;
    input.fertility01[7] = 0.1;
    input.surfaceTemperature[8] = 40;
    input.fertility01[8] = 2;
    input.aridityIndex[8] = -0.1;
    const before = structuredClone(input);
    const operation = ecology.features.ops.scoreWetMangrove;
    expect(operation.defaultConfig.config).toEqual({
      fertilityMin01: 0.15,
      aridityMax01: 0.7,
      tempWarmStartC: 18,
      tempWarmEndC: 30,
    });
    expect(Object.hasOwn(operation.input.properties, "water01")).toBe(false);
    expect(Value.Check(operation.input, input)).toBe(true);
    expect(Value.Check(operation.input, { ...input, water01: new Float32Array(size) })).toBe(false);
    expect(Value.Check(operation.strategies["warm-intertidal"].config, {
      ...operation.defaultConfig.config,
      waterMin01: 0.45,
    })).toBe(false);
    for (const other of [
      ecology.features.ops.scoreWetMarsh,
      ecology.features.ops.scoreWetTundraBog,
      ecology.features.ops.scoreWetOasis,
      ecology.features.ops.scoreWetWateringHole,
    ]) {
      expect(other.input.required).toContain("water01");
    }

    const selection = normalizeOperationSelectionForTest(operation, operation.defaultConfig);
    const score01 = operation.run(input, selection).score01;
    expect(score01[0]).toBeCloseTo(0.529412, 6);
    expect(score01[1]).toBeCloseTo(0.264706, 6);
    expect(score01[2]).toBeCloseTo(0.264706, 6);
    expect(Array.from(score01.slice(3, 8))).toEqual([0, 0, 0, 0, 0]);
    expect(score01[8]).toBe(1);
    expect(score01.every((score) => Number.isFinite(score) && score >= 0 && score <= 1)).toBe(true);
    expect(input).toEqual(before);

    const flatLandMask = new Uint8Array(size).fill(1);
    flatLandMask[8] = 0;
    const featureOccupancyMask = new Uint8Array(size);
    featureOccupancyMask[9] = 1;
    const plannerInput = {
      width,
      height,
      seed: TEST_MAP_SEED,
      scoreMarsh01: new Float32Array(size),
      scoreTundraBog01: new Float32Array(size),
      scoreMangrove01: score01,
      scoreOasis01: new Float32Array(size),
      scoreWateringHole01: new Float32Array(size),
      flatLandMask,
      terrainBiomeCompatibilityMasks: deriveWetlandTerrainBiomeCompatibilityMasks({
        width,
        height,
        flatLandMask,
        biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.tropicalRainforest),
      }),
      featureOccupancyMask,
    };
    const beforePlanner = structuredClone(plannerInput);
    const planner = ecology.features.ops.planWetlands;
    const plannerSelection = normalizeOperationSelectionForTest(planner, {
      strategy: "habitat-confidence",
      config: { minConfidence01: 0.35 },
    });
    expect(planner.run(plannerInput, plannerSelection).placements).toEqual([
      { x: 0, y: 0, feature: "mangrove" },
    ]);
    expect(plannerInput).toEqual(beforePlanner);
  });
});
