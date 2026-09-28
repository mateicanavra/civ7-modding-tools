import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { buildStepTestDependencies, publishTestArtifact, withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
import { artifacts as biomeArtifacts } from "../../../../../../../../src/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "../../../../../../../../src/domain/ecology/modules/pedology/artifacts/index.js";
import hydrology from "../../../../../../../../src/domain/hydrology/router.js";
import { artifacts as climateArtifacts } from "../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as erosionArtifacts } from "../../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as landformsArtifacts } from "../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { ClimateRefineStep } from "../../../../../../../../src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/step.js";
import { PedologyStep } from "../../../../../../../../src/recipes/standard/stages/ecology/pedology/steps/pedology/step.js";
import { BiomesStep } from "../../../../../../../../src/recipes/standard/stages/ecology/biomes/steps/biomes/step.js";
import { TEST_MAP_SEED } from "../../../../../../../setup.js";
import { createSurfaceWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";

const climate = hydrology.climate.ops;
const cryosphere = hydrology.cryosphere.ops;
const climateConfig = {
  refinePrecipitation: climate.refinePrecipitation.defaultConfig,
  computeRadiativeForcing: climate.computeRadiativeForcing.defaultConfig,
  computeThermalState: climate.computeThermalState.defaultConfig,
  applyAlbedoFeedback: cryosphere.applyAlbedoFeedback.defaultConfig,
  computeCryosphereState: cryosphere.computeCryosphereState.defaultConfig,
  computeLandWaterBudget: climate.computeLandWaterBudget.defaultConfig,
  computePotentialDemand: climate.computePotentialDemand.defaultConfig,
  computeClimateDiagnostics: climate.computeClimateDiagnostics.defaultConfig,
};

function runSurfaceConsumers(model: "certified-sill-spill" | "legacy-sink-budget") {
  const width = 8;
  const height = 1;
  const size = width * height;
  const fixture = createSurfaceWaterFixture(model, width, height);
  const before = structuredClone(fixture);
  const setup = admitMapSetup({
    mapSeed: TEST_MAP_SEED,
    dimensions: { width, height },
    latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
  });
  const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
  const { topography, wetCell } = fixture;
  const expectedExposure = topography.landMask.slice();
  if (model === "certified-sill-spill") expectedExposure[wetCell] = 0;
  const calls: string[] = [];
  let thermalWet = Number.NaN;
  let thermalDry = Number.NaN;
  let marineTreatment = Number.NaN;

  withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, landformsArtifacts.topography, topography);
    publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, fixture.lakePlan);
    publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, fixture.hydrography);
    publishTestArtifact(stepContext, erosionArtifacts.substrate, {
      erodibilityK: new Float32Array(size).fill(0.2),
      sedimentDepth: new Float32Array(size).fill(0.5),
    });
    publishTestArtifact(stepContext, climateArtifacts.baselineClimateField, {
      rainfall: new Uint8Array(size).fill(180),
      humidity: new Uint8Array(size).fill(150),
      potentialDemand: new Float32Array(size).fill(100),
      demandParameters: { tMinC: -10, tMaxC: 30, petBase: 40, petTemperatureWeight: 100, humidityDampening: 0.3 },
    });
    publishTestArtifact(stepContext, climateArtifacts.windField, {
      windU: new Int8Array(size), windV: new Int8Array(size),
    });
    ClimateRefineStep.run(stepContext, climateConfig, {
      refinePrecipitation: climate.refinePrecipitation.run,
      computeRadiativeForcing: climate.computeRadiativeForcing.run,
      computeThermalState: (...[input, config]: Parameters<typeof climate.computeThermalState.run>) => {
        calls.push("thermal");
        expect(input.landMask).toBe(topography.landMask);
        expect(input.elevation).toBe(topography.elevation);
        expect(input.seaLevel).toBe(topography.seaLevel);
        const output = climate.computeThermalState.run(input, config);
        const incorrectMarineMask = Uint8Array.from(input.landMask);
        incorrectMarineMask[wetCell] = 0;
        marineTreatment = climate.computeThermalState.run({ ...input, landMask: incorrectMarineMask }, config).surfaceTemperatureC[wetCell]!;
        thermalWet = output.surfaceTemperatureC[wetCell]!;
        thermalDry = output.surfaceTemperatureC[fixture.dryCell]!;
        return output;
      },
      applyAlbedoFeedback: (...[input, config]: Parameters<typeof cryosphere.applyAlbedoFeedback.run>) => {
        expect(input.landMask).toBe(topography.landMask);
        return cryosphere.applyAlbedoFeedback.run(input, config);
      },
      computeCryosphereState: (...[input, config]: Parameters<typeof cryosphere.computeCryosphereState.run>) => {
        expect(input.landMask).toBe(topography.landMask);
        return cryosphere.computeCryosphereState.run(input, config);
      },
      computePotentialDemand: (...[input, config]: Parameters<typeof climate.computePotentialDemand.run>) => {
        expect(input.landMask).toBe(topography.landMask);
        return climate.computePotentialDemand.run(input, config);
      },
      computeLandWaterBudget: (...[input, config]: Parameters<typeof climate.computeLandWaterBudget.run>) => {
        calls.push("water-budget");
        expect(input.landMask).toEqual(expectedExposure);
        if (model === "legacy-sink-budget") expect(input.landMask).toBe(topography.landMask);
        return climate.computeLandWaterBudget.run(input, config);
      },
      computeClimateDiagnostics: climate.computeClimateDiagnostics.run,
    }, buildStepTestDependencies(ClimateRefineStep, stepContext));

    PedologyStep.run(stepContext, { classify: ecology.pedology.ops.classifyPedology.defaultConfig }, {
      classify: (...[input, config]: Parameters<typeof ecology.pedology.ops.classifyPedology.run>) => {
        calls.push("pedology");
        expect(input.landMask).toEqual(expectedExposure);
        expect(input.elevation).toBe(topography.elevation);
        if (model === "legacy-sink-budget") expect(input.landMask).toBe(topography.landMask);
        return ecology.pedology.ops.classifyPedology.run(input, config);
      },
    }, buildStepTestDependencies(PedologyStep, stepContext));

    BiomesStep.run(stepContext, { classify: ecology.biomes.ops.classifyBiomes.defaultConfig }, {
      classify: (...[input, config]: Parameters<typeof ecology.biomes.ops.classifyBiomes.run>) => {
        calls.push("biomes");
        expect(input.landMask).toEqual(expectedExposure);
        if (model === "legacy-sink-budget") expect(input.landMask).toBe(topography.landMask);
        return ecology.biomes.ops.classifyBiomes.run(input, config);
      },
    }, buildStepTestDependencies(BiomesStep, stepContext));
  });

  expect(calls).toEqual(["thermal", "water-budget", "pedology", "biomes"]);
  expect(fixture).toEqual(before);
  expect(thermalWet).toBe(thermalDry);
  expect(thermalWet).toBeLessThan(marineTreatment);
  return {
    ...fixture,
    climateIndices: readArtifact(context, climateArtifacts.climateIndices),
    pedology: readArtifact(context, pedologyArtifacts.pedology),
    biomes: readArtifact(context, biomeArtifacts.biomeClassification),
  };
}

describe("elevated lake exposure across climate and terrestrial consumers", () => {
  it("excludes certified wet ground from soil, vegetation and land budgets without marine thermal treatment", () => {
    const certified = runSurfaceConsumers("certified-sill-spill");
    const legacy = runSurfaceConsumers("legacy-sink-budget");
    const { wetCell, dryCell, minorChannel, majorChannel } = certified;

    expect(certified.pedology.fertility[wetCell]).toBe(0);
    expect(certified.biomes.biomeIndex[wetCell]).toBe(255);
    expect(certified.biomes.vegetationDensity[wetCell]).toBe(0);
    expect(certified.climateIndices.effectiveMoisture[wetCell]).toBe(0);
    expect(certified.climateIndices.pet[wetCell]).toBe(0);
    expect(certified.climateIndices.surfaceTemperatureC).toEqual(legacy.climateIndices.surfaceTemperatureC);
    for (const cell of [dryCell, minorChannel, majorChannel]) {
      expect(certified.pedology.fertility[cell]).toBeGreaterThan(0);
      expect(certified.biomes.biomeIndex[cell]).not.toBe(255);
      expect(certified.biomes.vegetationDensity[cell]).toBeGreaterThan(0);
      expect(certified.climateIndices.effectiveMoisture[cell]).toBeGreaterThan(0);
    }
    expect(legacy.pedology.fertility[wetCell]).toBeGreaterThan(0);
    expect(legacy.biomes.biomeIndex[wetCell]).not.toBe(255);
    expect(legacy.biomes.vegetationDensity[wetCell]).toBeGreaterThan(0);
    expect(legacy.climateIndices.effectiveMoisture[wetCell]).toBeGreaterThan(0);
    expect(legacy.climateIndices.pet[wetCell]).toBeGreaterThan(0);
  });
});
