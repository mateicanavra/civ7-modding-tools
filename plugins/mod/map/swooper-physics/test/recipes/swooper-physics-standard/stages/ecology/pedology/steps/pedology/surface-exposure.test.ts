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
  applyAlbedoFeedback: cryosphere.applyAlbedoFeedback.defaultConfig,
  computeCryosphereState: cryosphere.computeCryosphereState.defaultConfig,
  computeLandWaterBudget: climate.computeLandWaterBudget.defaultConfig,
  computePotentialDemand: climate.computePotentialDemand.defaultConfig,
  computeClimateDiagnostics: climate.computeClimateDiagnostics.defaultConfig,
};

function runSurfaceConsumers() {
  const width = 8;
  const height = 1;
  const size = width * height;
  const fixture = createSurfaceWaterFixture(width, height);
  const before = structuredClone(fixture);
  const setup = admitMapSetup({
    mapSeed: TEST_MAP_SEED,
    dimensions: { width, height },
    latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
  });
  const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
  const { topography, wetCell } = fixture;
  const expectedExposure = topography.landMask.slice();
  expectedExposure[wetCell] = 0;
  const calls: string[] = [];
  const forcing = climate.computeRadiativeForcing.run({
    model: "daily-solar-fourier", width, height, latitudeByRow: Float32Array.of(0), axialTiltDeg: 23.44,
  }, climate.computeRadiativeForcing.defaultConfig);
  const thermalInput = {
    model: "periodic-response" as const,
    width, height, solarByRow: forcing.solarByRow,
    phases: [0.25, 0.75], weights: [0.5, 0.5],
    sstC: new Float32Array(size).fill(30),
    elevation: topography.elevation, seaLevel: topography.seaLevel,
    landMask: topography.landMask,
  };
  const baselineThermal = climate.computeThermalState.run(
    thermalInput, climate.computeThermalState.defaultConfig
  );
  const baselineTemperature = baselineThermal.annualSurfaceTemperatureC;
  const incorrectMarineMask = topography.landMask.slice();
  incorrectMarineMask[wetCell] = 0;
  const marineThermal = climate.computeThermalState.run(
    { ...thermalInput, landMask: incorrectMarineMask }, climate.computeThermalState.defaultConfig
  );
  const marineTreatment = marineThermal.annualSurfaceTemperatureC[wetCell]!;

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
    publishTestArtifact(stepContext, climateArtifacts.thermalField, {
      surfaceTemperatureC: baselineTemperature,
    });
    publishTestArtifact(stepContext, climateArtifacts.windField, {
      windU: new Int8Array(size), windV: new Int8Array(size),
    });
    ClimateRefineStep.run(stepContext, climateConfig, {
      refinePrecipitation: climate.refinePrecipitation.run,
      applyAlbedoFeedback: (...[input, config]: Parameters<typeof cryosphere.applyAlbedoFeedback.run>) => {
        calls.push("albedo");
        expect(input.surfaceTemperatureC).toBe(baselineTemperature);
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
        return climate.computeLandWaterBudget.run(input, config);
      },
      computeClimateDiagnostics: climate.computeClimateDiagnostics.run,
    }, buildStepTestDependencies(ClimateRefineStep, stepContext));

    PedologyStep.run(stepContext, { classify: ecology.pedology.ops.classifyPedology.defaultConfig }, {
      classify: (...[input, config]: Parameters<typeof ecology.pedology.ops.classifyPedology.run>) => {
        calls.push("pedology");
        expect(input.landMask).toEqual(expectedExposure);
        expect(input.elevation).toBe(topography.elevation);
        return ecology.pedology.ops.classifyPedology.run(input, config);
      },
    }, buildStepTestDependencies(PedologyStep, stepContext));

    BiomesStep.run(stepContext, { classify: ecology.biomes.ops.classifyBiomes.defaultConfig }, {
      classify: (...[input, config]: Parameters<typeof ecology.biomes.ops.classifyBiomes.run>) => {
        calls.push("biomes");
        expect(input.landMask).toEqual(expectedExposure);
        return ecology.biomes.ops.classifyBiomes.run(input, config);
      },
    }, buildStepTestDependencies(BiomesStep, stepContext));
  });

  expect(calls).toEqual(["albedo", "water-budget", "pedology", "biomes"]);
  expect(fixture).toEqual(before);
  expect(baselineTemperature[wetCell]).toBe(baselineTemperature[fixture.dryCell]);
  expect(baselineTemperature[wetCell]).toBeLessThan(marineTreatment);
  return {
    ...fixture,
    climateIndices: readArtifact(context, climateArtifacts.climateIndices),
    pedology: readArtifact(context, pedologyArtifacts.pedology),
    biomes: readArtifact(context, biomeArtifacts.biomeClassification),
  };
}

describe("elevated lake exposure across climate and terrestrial consumers", () => {
  it("excludes certified wet ground from soil, vegetation and land budgets without marine thermal treatment", () => {
    const certified = runSurfaceConsumers();
    const { wetCell, dryCell, minorChannel, majorChannel } = certified;

    expect(certified.pedology.fertility[wetCell]).toBe(0);
    expect(certified.biomes.biomeIndex[wetCell]).toBe(255);
    expect(certified.biomes.vegetationDensity[wetCell]).toBe(0);
    expect(certified.climateIndices.effectiveMoisture[wetCell]).toBe(0);
    expect(certified.climateIndices.pet[wetCell]).toBe(0);
    expect(certified.climateIndices.surfaceTemperatureC[wetCell]).toBe(certified.climateIndices.surfaceTemperatureC[dryCell]);
    for (const cell of [dryCell, minorChannel, majorChannel]) {
      expect(certified.pedology.fertility[cell]).toBeGreaterThan(0);
      expect(certified.biomes.biomeIndex[cell]).not.toBe(255);
      expect(certified.biomes.vegetationDensity[cell]).toBeGreaterThan(0);
      expect(certified.climateIndices.effectiveMoisture[cell]).toBeGreaterThan(0);
    }
  });
});
