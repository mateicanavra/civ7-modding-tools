import { describe, expect, it } from "bun:test";
import { biomeSymbolFromIndex } from "../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../src/domain/ecology/router.js";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import standardRecipe from "../../../../../src/recipes/standard/recipe.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../setup.js";
import {
  createStandardRecipeTestInitialSetup,
  standardMapConfig,
} from "../../fixtures/standard-recipe.js";

const compiled = standardRecipe.compileConfig(
  createStandardRecipeTestInitialSetup(),
  standardMapConfig.config
);
const cryosphereConfig = compiled["hydrology-climate-refine"]["climate-refine"].computeCryosphereState;
const biomeConfig = compiled["ecology-biomes"].biomes.classify;
const scoreConfig = compiled["ecology-features"]["score-layers"];
const plannerConfig = compiled["ecology-features"]["plan-vegetation"].planVegetation;

type ClimateCase = Readonly<{
  temperature: number;
  atmosphericMoisture?: number;
  plantStress?: number;
}>;

function runColdForestFlow(cases: readonly ClimateCase[]) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const landMask = new Uint8Array(size).fill(1);
  const surfaceTemperatureC = new Float32Array(size).fill(20);
  const rainfall = new Uint8Array(size).fill(120);
  const effectiveMoisture = new Float32Array(size).fill(130.60000610351562);
  const plantEffectiveMoisture = new Float32Array(size).fill(673.6563110351562);
  const aridityIndex = new Float32Array(size).fill(0.2);
  const plantWaterStress = new Float32Array(size).fill(0.02311249077320099);
  const soilType = new Uint8Array(size).fill(2);
  const fertility = new Float32Array(size).fill(0.41508251428604126);
  for (let i = 0; i < cases.length; i++) {
    surfaceTemperatureC[i] = cases[i]!.temperature;
    effectiveMoisture[i] = cases[i]!.atmosphericMoisture ?? effectiveMoisture[i]!;
    plantWaterStress[i] = cases[i]!.plantStress ?? plantWaterStress[i]!;
  }
  const heldFields = [
    landMask,
    surfaceTemperatureC,
    rainfall,
    effectiveMoisture,
    plantEffectiveMoisture,
    aridityIndex,
    plantWaterStress,
    soilType,
    fertility,
  ];
  const snapshots = heldFields.map((field) => field.slice());

  const cryosphere = hydrology.cryosphere.ops.computeCryosphereState.run(
    { width, height, landMask, surfaceTemperatureC, rainfall },
    cryosphereConfig
  );
  const biomes = ecology.biomes.ops.classifyBiomes.run(
    {
      width,
      height,
      landMask,
      surfaceTemperatureC,
      effectiveMoisture,
      plantEffectiveMoisture,
      aridityIndex,
      plantWaterStress,
      freezeIndex: cryosphere.freezeIndex,
      permafrost01: cryosphere.permafrost01,
      soilType,
      fertility,
    },
    biomeConfig
  );
  const substrate = ecology.features.ops.computeVegetationSubstrate.run(
    {
      width,
      height,
      landMask,
      surfaceTemperature: biomes.surfaceTemperature,
      effectiveMoisture: biomes.effectiveMoisture,
      plantEffectiveMoisture,
      aridityIndex: biomes.aridityIndex,
      plantWaterStress,
      freezeIndex: biomes.freezeIndex,
      vegetationDensity: biomes.vegetationDensity,
      fertility,
    },
    scoreConfig.vegetationSubstrate
  );
  const taiga = ecology.features.ops.scoreVegetationTaiga.run(
    {
      width,
      height,
      landMask,
      energy01: substrate.energy01,
      atmosphericWater01: substrate.atmosphericWater01,
      plantWaterStress01: substrate.plantWaterStress01,
      coldStress01: substrate.coldStress01,
      biomass01: substrate.biomass01,
      fertility01: substrate.fertility01,
    },
    scoreConfig.scoreTaiga
  );
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
      plantEffectiveMoisture,
      climaticAridityIndex: biomes.aridityIndex,
      vegetationDensity: biomes.vegetationDensity,
      scoreForest01: new Float32Array(size),
      scoreRainforest01: new Float32Array(size),
      scoreTaiga01: taiga.score01,
      scoreSavannaWoodland01: new Float32Array(size),
      scoreSagebrushSteppe01: new Float32Array(size),
    },
    plannerConfig
  );

  for (let i = 0; i < heldFields.length; i++) expect(heldFields[i]).toEqual(snapshots[i]);
  expect(biomes.surfaceTemperature).toEqual(surfaceTemperatureC);
  expect(biomes.effectiveMoisture).toEqual(effectiveMoisture);
  expect(biomes.aridityIndex).toEqual(aridityIndex);
  expect(biomes.freezeIndex).toEqual(cryosphere.freezeIndex);
  expect(substrate.coldStress01).toEqual(cryosphere.freezeIndex);
  expect(substrate.biomass01).toEqual(biomes.vegetationDensity);
  expect(substrate.plantWaterStress01).toEqual(plantWaterStress);

  return { cryosphere, biomes, substrate, taiga, vegetation };
}

describe("Earthlike cold-forest consumer flow", () => {
  it("admits boreal and colder opportunity through the actual producer chain without leaking at energy zero", () => {
    // Retained Huge seed2 thermal/plant-water witness at (38,9), index992, then boundary probes.
    const cases = [
      { temperature: 0.1835019886493683 },
      { temperature: 2 },
      { temperature: -5 },
      { temperature: -12, atmosphericMoisture: 80 },
      { temperature: -22 },
      { temperature: -40 },
      { temperature: 20 },
    ];
    const result = runColdForestFlow(cases);

    expect(cryosphereConfig.config.freezeIndexStartC).toBe(2);
    expect(cryosphereConfig.config.freezeIndexFullC).toBe(-12);
    expect(biomeConfig.config.temperature.polarCutoff).toBe(-1);
    expect(biomeConfig.config.temperature.tundraCutoff).toBe(4);
    expect(scoreConfig.vegetationSubstrate.config.temperatureMinC).toBe(-22);
    expect(scoreConfig.vegetationSubstrate.config.temperatureMaxC).toBe(42);
    expect(plannerConfig.config.taigaMinConfidence01).toBe(0);
    expect(result.cryosphere.freezeIndex[0]).toBe(0.1297498643398285);
    expect(result.substrate.energy01[0]).toBe(0.3466172218322754);
    expect(result.substrate.biomass01[0]).toBe(0.038507942110300064);
    expect(result.substrate.atmosphericWater01[0]).toBe(Math.fround(130.60000610351562 / 238));
    expect(result.substrate.plantWater01[0]).toBe(1);
    expect(result.cryosphere.freezeIndex[1]).toBe(0);
    expect(result.cryosphere.freezeIndex[3]).toBe(1);

    expect(Array.from(result.biomes.biomeIndex.slice(0, 4), biomeSymbolFromIndex)).toEqual([
      "boreal", "boreal", "tundra", "snow",
    ]);
    for (const i of [0, 1, 2, 3]) expect(result.taiga.score01[i]).toBeGreaterThan(0);
    for (const i of [4, 5]) {
      expect(result.substrate.energy01[i]).toBe(0);
      expect(result.substrate.coldStress01[i]).toBe(1);
      expect(result.taiga.score01[i]).toBe(0);
    }
    expect(result.taiga.score01[6]).toBe(0);
    expect(result.vegetation.placements).toEqual([
      { x: 0, y: 0, feature: "taiga" },
      { x: 1, y: 0, feature: "taiga" },
      { x: 2, y: 0, feature: "taiga" },
      { x: 3, y: 0, feature: "taiga" },
    ]);
    expect(runColdForestFlow(cases)).toEqual(result);
  });

  it("keeps atmospheric habitat separate from improved plant-water opportunity", () => {
    const { substrate, taiga, biomes, vegetation } = runColdForestFlow([
      { temperature: 2, plantStress: 1 },
      { temperature: 2, plantStress: 0 },
    ]);

    expect(substrate.atmosphericWater01[1]).toBe(substrate.atmosphericWater01[0]);
    expect(substrate.plantWater01[0]).toBe(1);
    expect(substrate.plantWater01[1]).toBe(1);
    expect(substrate.plantWaterStress01.slice(0, 2)).toEqual(new Float32Array([1, 0]));
    expect(Array.from(biomes.biomeIndex.slice(0, 2), biomeSymbolFromIndex)).toEqual(["boreal", "boreal"]);
    expect(taiga.score01[0]).toBeGreaterThan(0);
    expect(taiga.score01[1]).toBeGreaterThan(taiga.score01[0]!);
    expect(vegetation.placements).toEqual([
      { x: 0, y: 0, feature: "taiga" },
      { x: 1, y: 0, feature: "taiga" },
    ]);
  });
});
