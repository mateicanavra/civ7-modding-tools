import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as climateArtifacts } from "../../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import hydrologyDomain from "../../../../../../../../../src/domain/hydrology/router.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  validateSchemaValueForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import hydrologyClimateBaselineStage from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/index.js";
import { config as climateBaselineStepConfig } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.js";
import { ClimateBaselineStep } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

type OceanCurrentsInput = Parameters<
  typeof hydrologyDomain.ocean.ops.computeOceanSurfaceCurrents.run
>[0];
type OceanThermalInput = Parameters<
  typeof hydrologyDomain.ocean.ops.computeOceanThermalState.run
>[0];
type ThermalStateInput = Parameters<typeof hydrologyDomain.climate.ops.computeThermalState.run>[0];
type AtmosphericCirculationInput = Parameters<
  typeof hydrologyDomain.climate.ops.computeAtmosphericCirculation.run
>[0];
type PrecipitationInput = Parameters<
  typeof hydrologyDomain.climate.ops.computePrecipitation.run
>[0];

function climateBaselineConfig(options: Readonly<{ axialTiltDeg?: number }> = {}) {
  if (!ClimateBaselineStep.normalize) {
    throw new Error("Climate baseline must normalize its authored configuration.");
  }
  const stageConfig = createStandardRecipeTestConfig()["hydrology-climate-baseline"];
  if (options.axialTiltDeg !== undefined) {
    stageConfig.knobs.seasonality = "normal";
    stageConfig["climate-baseline"].seasonality.axialTiltDeg = options.axialTiltDeg;
  }
  const admitted = validateSchemaValueForTest(
    hydrologyClimateBaselineStage.surfaceSchema,
    stageConfig,
    "/hydrology-climate-baseline"
  );
  const { knobs, rawSteps } = hydrologyClimateBaselineStage.toInternal({
    setup,
    stageConfig: admitted,
  });
  const config = validateSchemaValueForTest(
    climateBaselineStepConfig.schema,
    rawSteps["climate-baseline"],
    "/hydrology-climate-baseline/climate-baseline"
  );
  return validateSchemaValueForTest(
    climateBaselineStepConfig.schema,
    ClimateBaselineStep.normalize(config, { setup, knobs }),
    "/hydrology-climate-baseline/climate-baseline"
  );
}

function captureSeasonalEvidence(axialTiltDeg: number) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const config = climateBaselineConfig({ axialTiltDeg });
  const context = createMapContext({
    setup,
    adapter: createMockAdapter({ width, height }),
  });
  const seasonPhases: number[] = [];
  let rainfallAmplitude: ArrayLike<number> | undefined;
  let humidityAmplitude: ArrayLike<number> | undefined;

  withMapContextExecutionForTest(context, (stepContext) => {
    const dependencies = buildStepTestDependencies(ClimateBaselineStep, stepContext);
    publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask: new Uint8Array(size),
      bathymetry: new Int16Array(size),
    });
    publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, {
      shelfMask: new Uint8Array(size),
      coastalLand: new Uint8Array(size),
      coastalWater: new Uint8Array(size),
      distanceToCoast: new Uint16Array(size),
    });

    const result = ClimateBaselineStep.run(
      stepContext,
      config,
      {
        computeOceanGeometry: () => ({
          basinId: new Int32Array(size),
          coastDistance: new Uint16Array(size),
          coastNormalU: new Int8Array(size),
          coastNormalV: new Int8Array(size),
          coastTangentU: new Int8Array(size),
          coastTangentV: new Int8Array(size),
        }),
        computeAtmosphericCirculation: (input: AtmosphericCirculationInput) => {
          const seasonPhase = input.seasonPhase01 ?? 0;
          seasonPhases.push(seasonPhase);
          return {
            windU: new Int8Array(size).fill(Math.round(seasonPhase * 100)),
            windV: new Int8Array(size),
          };
        },
        computeOceanSurfaceCurrents: () => ({
          currentU: new Int8Array(size),
          currentV: new Int8Array(size),
        }),
        computeOceanThermalState: () => ({
          sstC: new Float32Array(size),
          seaIceMask: new Uint8Array(size),
        }),
        computeRadiativeForcing: () => ({ insolation: new Float32Array(size) }),
        computeThermalState: () => ({ surfaceTemperatureC: new Float32Array(size) }),
        computeEvaporationSources: () => ({ evaporation: new Float32Array(size) }),
        transportMoisture: () => ({ humidity: new Float32Array(size) }),
        computePrecipitation: (input: PrecipitationInput) => {
          const windSignal = Math.abs(input.windU[0] ?? 0);
          return {
            rainfall: new Uint8Array(size).fill(windSignal),
            humidity: new Uint8Array(size).fill(windSignal),
          };
        },
      },
      dependencies
    );
    if (result instanceof Promise) {
      throw new Error("Climate baseline composition is synchronous in the Standard recipe.");
    }
    rainfallAmplitude = result.seasonalAmplitudes.rainfallAmplitude;
    humidityAmplitude = result.seasonalAmplitudes.humidityAmplitude;
  });

  if (!rainfallAmplitude || !humidityAmplitude) {
    throw new Error("Climate baseline must return seasonal amplitude evidence.");
  }
  return {
    axialTiltDeg: config.seasonality.axialTiltDeg,
    modeCount: config.seasonality.modeCount,
    seasonPhases,
    rainfallAmplitude,
    humidityAmplitude,
  };
}

describe("hydrology climate-baseline composition", () => {
  it("passes computed winds into currents and their seasonal mean into ocean thermal state", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const config = climateBaselineConfig();
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width, height }),
    });
    const windU = new Int8Array(size).fill(7);
    const windV = new Int8Array(size).fill(-3);
    const currentValuesU = Array.from(
      { length: config.seasonality.modeCount },
      (_, index) => (index + 1) * 10
    );
    const currentValuesV = Array.from(
      { length: config.seasonality.modeCount },
      (_, index) => (index + 1) * 2
    );
    const seasonalCurrentU = currentValuesU.map((value) => new Int8Array(size).fill(value));
    const seasonalCurrentV = currentValuesV.map((value) => new Int8Array(size).fill(value));
    const expectedCurrentU = Math.round(
      currentValuesU.reduce((sum, value) => sum + value, 0) / currentValuesU.length
    );
    const expectedCurrentV = Math.round(
      currentValuesV.reduce((sum, value) => sum + value, 0) / currentValuesV.length
    );
    const sstC = new Float32Array(size).fill(22.5);
    const seaIceMask = new Uint8Array(size);
    const currentInputs: Array<{
      windU: ArrayLike<number>;
      windV: ArrayLike<number>;
    }> = [];
    let currentCall = 0;
    let thermalCurrentU: ArrayLike<number> | undefined;
    let thermalCurrentV: ArrayLike<number> | undefined;
    let currentField:
      | Readonly<{
          currentU: ArrayLike<number>;
          currentV: ArrayLike<number>;
        }>
      | undefined;
    const thermalSstInputs: Array<ArrayLike<number> | undefined> = [];

    withMapContextExecutionForTest(context, (stepContext) => {
      const dependencies = buildStepTestDependencies(ClimateBaselineStep, stepContext);
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, {
        shelfMask: new Uint8Array(size),
        coastalLand: new Uint8Array(size),
        coastalWater: new Uint8Array(size),
        distanceToCoast: new Uint16Array(size),
      });

      const result = ClimateBaselineStep.run(
        stepContext,
        config,
        {
          computeOceanGeometry: () => ({
            basinId: new Int32Array(size),
            coastDistance: new Uint16Array(size),
            coastNormalU: new Int8Array(size),
            coastNormalV: new Int8Array(size),
            coastTangentU: new Int8Array(size),
            coastTangentV: new Int8Array(size),
          }),
          computeAtmosphericCirculation: () => ({ windU, windV }),
          computeOceanSurfaceCurrents: (input: OceanCurrentsInput) => {
            currentInputs.push({ windU: input.windU, windV: input.windV });
            const output = {
              currentU: seasonalCurrentU[currentCall]!,
              currentV: seasonalCurrentV[currentCall]!,
            };
            currentCall += 1;
            return output;
          },
          computeOceanThermalState: (input: OceanThermalInput) => {
            thermalCurrentU = input.currentU;
            thermalCurrentV = input.currentV;
            return { sstC, seaIceMask };
          },
          computeRadiativeForcing: () => ({ insolation: new Float32Array(size) }),
          computeThermalState: (input: ThermalStateInput) => {
            thermalSstInputs.push(input.sstC);
            return { surfaceTemperatureC: new Float32Array(size) };
          },
          computeEvaporationSources: () => ({ evaporation: new Float32Array(size) }),
          transportMoisture: () => ({ humidity: new Float32Array(size) }),
          computePrecipitation: () => ({
            rainfall: new Uint8Array(size),
            humidity: new Uint8Array(size),
          }),
        },
        dependencies
      );
      if (result instanceof Promise) {
        throw new Error("Climate baseline composition is synchronous in the Standard recipe.");
      }
      currentField = result.currentField;
    });

    expect(currentInputs).toHaveLength(config.seasonality.modeCount);
    for (const input of currentInputs) {
      expect(input.windU).toBe(windU);
      expect(input.windV).toBe(windV);
    }
    expect(Array.from(thermalCurrentU ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(expectedCurrentU))
    );
    expect(Array.from(thermalCurrentV ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(expectedCurrentV))
    );
    expect(thermalSstInputs).toHaveLength(config.seasonality.modeCount);
    for (const observedSst of thermalSstInputs) expect(observedSst).toBe(sstC);

    const windField = readArtifact(context, climateArtifacts.windField);
    expect(Array.from(windField.windU)).toEqual(Array.from(windU));
    expect(Array.from(windField.windV)).toEqual(Array.from(windV));
    expect(Array.from(currentField?.currentU ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(expectedCurrentU))
    );
    expect(Array.from(currentField?.currentV ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(expectedCurrentV))
    );
  });

  it("returns zero seasonal amplitude when axial tilt disables seasonal forcing", () => {
    const evidence = captureSeasonalEvidence(0);

    expect(evidence.axialTiltDeg).toBe(0);
    expect(evidence.seasonPhases).toEqual(new Array(evidence.modeCount).fill(0));
    expect(Array.from(evidence.rainfallAmplitude).every((value) => value === 0)).toBeTrue();
    expect(Array.from(evidence.humidityAmplitude).every((value) => value === 0)).toBeTrue();
  });

  it("returns nonzero seasonal amplitude when axial tilt enables seasonal forcing", () => {
    const evidence = captureSeasonalEvidence(18);

    expect(evidence.axialTiltDeg).toBe(18);
    expect(new Set(evidence.seasonPhases).size).toBeGreaterThan(1);
    expect(Array.from(evidence.rainfallAmplitude).some((value) => value > 0)).toBeTrue();
    expect(Array.from(evidence.humidityAmplitude).some((value) => value > 0)).toBeTrue();
  });
});
