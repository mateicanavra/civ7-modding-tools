import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import { BIOME_SYMBOL_TO_INDEX, biomeSymbolFromIndex } from "../../../../src/domain/ecology/index.js";
import ecology from "../../../../src/domain/ecology/router.js";
import hydrology from "../../../../src/domain/hydrology/router.js";
import standardRecipe from "../../../../src/recipes/standard/recipe.js";
import { deriveFeatureOccupancy } from "../../../../src/recipes/standard/stages/ecology/features/model/policy/derive-feature-occupancy.js";
import { deriveWetlandTerrainBiomeCompatibilityMasks } from "../../../../src/recipes/standard/stages/ecology/model/policy/wetland-terrain-biome-compatibility.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { noLocalWaterSources } from "../../../fixtures/local-water-sources.js";
import {
  createStandardRecipeTestInitialSetup,
  standardMapConfig,
} from "../../../recipes/swooper-physics-standard/fixtures/standard-recipe.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology wetland-family habitats", () => {
  it("requires hydromorphic, intertidal, or admitted local water-source evidence", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const hydromorphicMask = new Uint8Array(size);
    hydromorphicMask[1] = 1;
    const intertidalCoastMask = new Uint8Array(size);
    intertidalCoastMask[1] = 1;
    const localSurfaceWaterOpportunity = new Float32Array(size);
    localSurfaceWaterOpportunity[1] = 60;
    const water01 = new Float32Array(size).fill(0.85);
    const fertility01 = new Float32Array(size).fill(0.7);
    const surfaceTemperature = new Float32Array(size).fill(14);
    const mangroveTemperature = new Float32Array(size).fill(24);
    const coldTemperature = new Float32Array(size);
    const aridityIndex = new Float32Array(size).fill(0.25);
    const dryAridityIndex = new Float32Array(size).fill(0.8);
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
        localSurfaceWaterOpportunity,
        pet: new Float32Array(size).fill(30),
        aridityIndex: dryAridityIndex,
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

  it("scores cold hydromorphic response without fertility and retains planner admission gates", () => {
    const width = 11;
    const height = 1;
    const size = width * height;
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      hydromorphicMask: new Uint8Array(size).fill(1),
      water01: new Float32Array(size).fill(0.85),
      surfaceTemperature: new Float32Array(size).fill(-10),
      freezeIndex: new Float32Array(size).fill(0.85),
    };
    input.water01[1] = 0.5;
    input.freezeIndex[2] = 0.5;
    input.surfaceTemperature[3] = 14;
    input.hydromorphicMask[4] = 0;
    input.landMask[5] = 0;
    input.surfaceTemperature[6] = 9;
    input.water01.fill(1, 7);
    input.freezeIndex.fill(1, 7);
    input.surfaceTemperature[7] = 4;
    input.water01[10] = 2;
    input.freezeIndex[10] = 2;
    input.surfaceTemperature[10] = -100;
    const before = structuredClone(input);
    const operation = ecology.features.ops.scoreWetTundraBog;
    expect(operation.defaultConfig).toEqual({
      strategy: "cold-hydromorphic",
      config: { waterMin01: 0.55, freezeMin01: 0.55, tempColdMaxC: 4, tempWarmMaxC: 14 },
    });
    expect(Object.keys(operation.input.properties).sort()).toEqual([
      "freezeIndex", "height", "hydromorphicMask", "landMask", "surfaceTemperature", "water01", "width",
    ]);
    expect(Value.Check(operation.input, input)).toBe(true);
    const obsoleteInput = { ...input, fertility01: new Float32Array(size) };
    expect(Value.Check(operation.input, obsoleteInput)).toBe(false);
    const obsoleteSelection = {
      ...operation.defaultConfig,
      config: { ...operation.defaultConfig.config, fertilityMin01: 0.1 },
    };
    expect(Value.Check(operation.strategies["cold-hydromorphic"].config, obsoleteSelection.config)).toBe(false);
    expect(() => normalizeOperationSelectionForTest(operation, obsoleteSelection)).toThrow("Unknown key");
    expect(ecology.features.ops.scoreWetMarsh.input.required).toContain("fertility01");
    expect(ecology.features.ops.scoreWetMangrove.input.required).not.toContain("fertility01");

    const selection = normalizeOperationSelectionForTest(operation, operation.defaultConfig);
    expect(() => operation.run(obsoleteInput, selection)).toThrow("input admission");
    const score01 = operation.run(input, selection).score01;
    const waterSuit = (input.water01[0]! - 0.55) / (1 - 0.55);
    const freezeSuit = (input.freezeIndex[0]! - 0.55) / (1 - 0.55);
    expect(score01[0]).toBe(Math.fround(waterSuit * 1 * freezeSuit));
    expect(Array.from(score01.slice(1, 6))).toEqual([0, 0, 0, 0, 0]);
    expect(score01[6]).toBe(Math.fround(waterSuit * 0.5 * freezeSuit));
    expect(Array.from(score01.slice(7))).toEqual([1, 1, 1, 1]);
    expect(score01.every((score) => Number.isFinite(score) && score >= 0 && score <= 1)).toBe(true);
    expect(operation.run(input, selection).score01).toEqual(score01);
    expect(input).toEqual(before);

    const flatLandMask = new Uint8Array(size).fill(1);
    flatLandMask[5] = flatLandMask[7] = 0;
    const biomeIndex = new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.tundra);
    biomeIndex[8] = BIOME_SYMBOL_TO_INDEX.desert;
    const featureOccupancyMask = new Uint8Array(size);
    featureOccupancyMask[9] = 1;
    const plannerInput = {
      width,
      height,
      seed: TEST_MAP_SEED,
      scoreMarsh01: new Float32Array(size),
      scoreTundraBog01: score01,
      scoreMangrove01: new Float32Array(size),
      scoreOasis01: new Float32Array(size),
      scoreWateringHole01: new Float32Array(size),
      flatLandMask,
      terrainBiomeCompatibilityMasks: deriveWetlandTerrainBiomeCompatibilityMasks({
        width, height, flatLandMask, biomeIndex,
      }),
      featureOccupancyMask,
    };
    const beforePlanner = structuredClone(plannerInput);
    const planner = ecology.features.ops.planWetlands;
    const plannerSelection = normalizeOperationSelectionForTest(planner, {
      strategy: "habitat-confidence",
      config: { minConfidence01: 0.42 },
    });
    expect(planner.run(plannerInput, plannerSelection).placements).toEqual([
      { x: 0, y: 0, feature: "tundra-bog" },
      { x: 10, y: 0, feature: "tundra-bog" },
    ]);
    expect(plannerInput).toEqual(beforePlanner);
  });

  it("scores coarse marine mangrove occurrence without fertility or terrestrial water and retains planner admission gates", () => {
    const width = 11;
    const height = 1;
    const size = width * height;
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      intertidalCoastMask: new Uint8Array(size).fill(1),
      surfaceTemperature: new Float32Array(size).fill(30),
      aridityIndex: new Float32Array(size).fill(0.4),
    };
    input.surfaceTemperature[1] = 24;
    input.aridityIndex[2] = 0.85;
    input.surfaceTemperature[3] = 18;
    input.aridityIndex[4] = 1;
    input.intertidalCoastMask[5] = 0;
    input.landMask[6] = 0;
    input.surfaceTemperature[7] = 23;
    input.surfaceTemperature[8] = 40;
    input.aridityIndex[8] = -0.1;
    const before = structuredClone(input);
    const operation = ecology.features.ops.scoreWetMangrove;
    expect(operation.defaultConfig.config).toEqual({
      aridityMax01: 0.7,
      tempWarmStartC: 18,
      tempWarmEndC: 30,
    });
    expect(Object.keys(operation.input.properties).sort()).toEqual([
      "aridityIndex", "height", "intertidalCoastMask", "landMask", "surfaceTemperature", "width",
    ]);
    expect(Value.Check(operation.input, input)).toBe(true);
    const selection = normalizeOperationSelectionForTest(operation, operation.defaultConfig);
    for (const key of ["fertility01", "water01"]) {
      const obsoleteInput = { ...input, [key]: new Float32Array(size) };
      expect(Value.Check(operation.input, obsoleteInput)).toBe(false);
      expect(() => operation.run(obsoleteInput, selection)).toThrow("input admission");
    }
    for (const key of ["fertilityMin01", "waterMin01"]) {
      const obsoleteSelection = {
        ...operation.defaultConfig,
        config: { ...operation.defaultConfig.config, [key]: 0.15 },
      };
      expect(Value.Check(operation.strategies["warm-intertidal"].config, obsoleteSelection.config)).toBe(false);
      expect(() => normalizeOperationSelectionForTest(operation, obsoleteSelection)).toThrow("Unknown key");
    }
    expect(ecology.features.ops.scoreWetMarsh.input.required).toContain("fertility01");
    for (const other of [
      ecology.features.ops.scoreWetMarsh,
      ecology.features.ops.scoreWetTundraBog,
    ]) {
      expect(other.input.required).toContain("water01");
    }
    for (const other of [ecology.features.ops.scoreWetOasis, ecology.features.ops.scoreWetWateringHole]) {
      expect(other.input.required).toContain("localSurfaceWaterOpportunity");
      expect(other.input.required).toContain("pet");
      expect(Object.hasOwn(other.input.properties, "plantWater01")).toBe(false);
    }

    const score01 = operation.run(input, selection).score01;
    expect(score01[0]).toBe(1);
    expect(score01[1]).toBe(0.5);
    expect(score01[2]).toBeCloseTo(0.5, 6);
    expect(Array.from(score01.slice(3, 7))).toEqual([0, 0, 0, 0]);
    expect(score01[7]).toBe(Math.fround(5 / 12));
    expect(score01[8]).toBe(1);
    expect(score01.every((score) => Number.isFinite(score) && score >= 0 && score <= 1)).toBe(true);
    expect(input).toEqual(before);
    expect(operation.run(input, selection).score01).toEqual(score01);

    const flatLandMask = new Uint8Array(size).fill(1);
    flatLandMask[8] = 0;
    const featureOccupancyMask = deriveFeatureOccupancy({ width, height }, [{ x: 9, y: 0 }]);
    const biomeIndex = new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.tropicalRainforest);
    biomeIndex[10] = BIOME_SYMBOL_TO_INDEX.desert;
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
        biomeIndex,
      }),
      featureOccupancyMask,
    };
    const beforePlanner = structuredClone(plannerInput);
    const planner = ecology.features.ops.planWetlands;
    const plannerSelection = normalizeOperationSelectionForTest(planner, {
      strategy: "habitat-confidence",
      config: { minConfidence01: 0.42 },
    });
    expect(planner.run(plannerInput, plannerSelection).placements).toEqual([
      { x: 0, y: 0, feature: "mangrove" },
      { x: 1, y: 0, feature: "mangrove" },
      { x: 2, y: 0, feature: "mangrove" },
    ]);
    expect(plannerInput).toEqual(beforePlanner);
  });

  it("admits producer-derived humid marine mangroves independent of sediment while retaining dry and official-biome guards", () => {
    const compiled = standardRecipe.compileConfig(createStandardRecipeTestInitialSetup(), standardMapConfig.config);
    const baseline = compiled["hydrology-climate-baseline"]["climate-baseline"];
    const refine = compiled["hydrology-climate-refine"]["climate-refine"];
    const scoring = compiled["ecology-features"]["score-layers"];
    const plannerConfig = compiled["ecology-features"]["plan-wetlands"].planWetlands;
    const width = 5, height = 3, size = width * height, marineWater = 7, receiver = 8;
    const wetFertility: number[] = [];
    expect(plannerConfig.config.minConfidence01).toBe(0.42);
    for (const [precipitation, wetnessByteEquivalent, sediment] of [[200, 255, 1], [200, 255, 0.2], [100, 128, 0.2], [0, 0, 1]] as const) {
      // Matched precipitation encodings and constant 24 C thermal profiles are
      // local regimes, not evidence of generated climate reachability.
      const surfaceTemperatureC = new Float32Array(size).fill(24);
      const coldestMonthMeanSurfaceTemperatureC = new Float32Array(size).fill(24);
      const surfaceWetness = new Float32Array(size).fill(wetnessByteEquivalent / 255);
      const demand = hydrology.climate.ops.computePotentialDemand.run({
        width, height, surfaceTemperatureC, surfaceWetness, parameters: baseline.potentialDemand,
      }, refine.computePotentialDemand);
      const budgetInput = { width, height, ...noLocalWaterSources(width, height),
        landMask: new Uint8Array(size).fill(1), precipitation: new Float32Array(size).fill(precipitation),
        surfaceWetness, pet: demand.pet };
      budgetInput.elevation.fill(10);
      budgetInput.landMask[marineWater] = 0;
      budgetInput.externalWaterMask[marineWater] = 1;
      budgetInput.elevation[marineWater] = -1;
      const sedimentDepth = new Float32Array(size).fill(sediment);
      const before = structuredClone({ budgetInput, surfaceTemperatureC, sedimentDepth });
      const indices = hydrology.climate.ops.computeLandWaterBudget.run(budgetInput, refine.computeLandWaterBudget);
      const cryosphere = hydrology.cryosphere.ops.computeCryosphereState.run({
        width, height, landMask: budgetInput.landMask, surfaceTemperatureC, precipitation: budgetInput.precipitation,
      }, refine.computeCryosphereState);
      const pedology = ecology.pedology.ops.classifyPedology.run({
        width, height, landMask: budgetInput.landMask, elevation: budgetInput.elevation,
        precipitation: budgetInput.precipitation, surfaceWetness, sedimentDepth,
      }, compiled["ecology-pedology"].pedology.classify);
      const biomes = ecology.biomes.ops.classifyBiomes.run({
        width, height, landMask: budgetInput.landMask, surfaceTemperatureC,
        coldestMonthMeanSurfaceTemperatureC,
        freezeIndex: cryosphere.freezeIndex, permafrost01: cryosphere.permafrost01,
        effectiveMoisture: indices.effectiveMoisture, aridityIndex: indices.aridityIndex,
        plantEffectiveMoisture: indices.plantEffectiveMoisture, plantWaterStress: indices.plantWaterStress,
        soilType: pedology.soilType, fertility: pedology.fertility,
      }, compiled["ecology-biomes"].biomes.classify);
      const substrate = ecology.features.ops.computeFeatureSubstrate.run({
        width, height, landMask: budgetInput.landMask, externalWaterMask: budgetInput.externalWaterMask,
        elevation: budgetInput.elevation, seaLevel: 0, riverClass: new Uint8Array(size),
        navigableRiverMask: new Uint8Array(size), discharge: budgetInput.discharge,
      }, scoring.featureSubstrate);
      const scoreMangrove01 = ecology.features.ops.scoreWetMangrove.run({
        width, height, landMask: budgetInput.landMask, intertidalCoastMask: substrate.intertidalCoastMask,
        surfaceTemperature: surfaceTemperatureC, aridityIndex: indices.aridityIndex,
      }, scoring.scoreWetMangrove).score01;
      const flatLandMask = budgetInput.landMask.slice();
      const compatibility = deriveWetlandTerrainBiomeCompatibilityMasks({
        width, height, flatLandMask, biomeIndex: biomes.biomeIndex,
      });
      const placements = ecology.features.ops.planWetlands.run({
        width, height, seed: TEST_MAP_SEED, flatLandMask,
        featureOccupancyMask: deriveFeatureOccupancy({ width, height }),
        terrainBiomeCompatibilityMasks: compatibility, scoreMangrove01,
        scoreMarsh01: new Float32Array(size), scoreTundraBog01: new Float32Array(size),
        scoreOasis01: new Float32Array(size), scoreWateringHole01: new Float32Array(size),
      }, plannerConfig).placements.filter(({ x, y }) => y * width + x === receiver);
      expect(substrate.intertidalCoastMask[receiver]).toBe(1);
      expect(indices.localSurfaceWaterOpportunity[receiver]).toBe(0);
      expect(biomeSymbolFromIndex(biomes.biomeIndex[receiver]!)).toBe(
        precipitation === 200 ? "tropicalRainforest" : precipitation === 100 ? "tropicalSeasonal" : "desert"
      );
      expect(compatibility.mangrove[receiver]).toBe(precipitation === 200 ? 1 : 0);
      if (precipitation > 0) expect(scoreMangrove01[receiver]).toBe(0.5);
      else {
        expect(scoreMangrove01[receiver]).toBeGreaterThan(0);
        expect(scoreMangrove01[receiver]).toBeLessThan(plannerConfig.config.minConfidence01);
      }
      expect(placements).toEqual(precipitation === 200 ? [{ x: 3, y: 1, feature: "mangrove" }] : []);
      if (precipitation === 200) wetFertility.push(pedology.fertility[receiver]!);
      expect({ budgetInput, surfaceTemperatureC, sedimentDepth }).toEqual(before);
    }
    expect(wetFertility[0]).not.toBe(wetFertility[1]);
  });
});
