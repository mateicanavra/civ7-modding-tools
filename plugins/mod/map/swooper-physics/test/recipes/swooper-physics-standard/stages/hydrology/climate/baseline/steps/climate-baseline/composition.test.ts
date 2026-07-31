import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as climateArtifacts } from "../../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import hydrologyDomain from "../../../../../../../../../src/domain/hydrology/router.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { DEFAULT_ELEVATION_SCALE } from "../../../../../../../../../src/domain/morphology/model/policy/elevation-scale.js";
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
type PressureFieldInput = Parameters<
  typeof hydrologyDomain.climate.ops.computePressureField.run
>[0];
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
  const seasonSalts: number[] = [];
  const transientPolarities: number[] = [];
  const circulationTopLatitudes: number[] = [];
  let seasonalFieldCounts: readonly number[] = [];
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
        computePressureField: (input: PressureFieldInput) => {
          seasonSalts.push(input.seasonSalt ?? 0);
          transientPolarities.push(input.transientPolarity ?? 0);
          return { pressure: new Float32Array(size) };
        },
        computeAtmosphericCirculation: (input: AtmosphericCirculationInput) => {
          const circulationTopLatitude = input.latitudeByRow[0] ?? 0;
          circulationTopLatitudes.push(circulationTopLatitude);
          return {
            windU: new Int8Array(size).fill(Math.round(circulationTopLatitude)),
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
    seasonalFieldCounts = [
      result.seasonalRainfall.length,
      result.seasonalHumidity.length,
      result.seasonalPressure.length,
      result.seasonalWindU.length,
      result.seasonalWindV.length,
      result.seasonalCurrentU.length,
      result.seasonalCurrentV.length,
    ];
  });

  if (!rainfallAmplitude || !humidityAmplitude) {
    throw new Error("Climate baseline must return seasonal amplitude evidence.");
  }
  return {
    axialTiltDeg: config.seasonality.axialTiltDeg,
    modeCount: config.seasonality.modeCount,
    couplingIterations: config.coupling.iterations,
    seasonSalts,
    transientPolarities,
    circulationTopLatitudes,
    seasonalFieldCounts,
    rainfallAmplitude,
    humidityAmplitude,
  };
}

describe("hydrology climate-baseline composition", () => {
  it("publishes one final pressure-wind-current vintage from the converged SST", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const config = climateBaselineConfig();
    const modeCount = config.seasonality.modeCount;
    const couplingIterations = config.coupling.iterations;
    const cycleSeasonCalls = modeCount * couplingIterations;
    const atmosphereSeasonCalls = modeCount * (couplingIterations + 1);
    const weatherCalls = atmosphereSeasonCalls * 2;
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width, height }),
    });
    const topographyElevation = new Int16Array(size).fill(DEFAULT_ELEVATION_SCALE);
    const windValuesU = Array.from({ length: weatherCalls }, (_, index) => index + 1);
    const windValuesV = windValuesU.map((value) => -value);
    const currentValuesU = windValuesU.map((value) => value * 4);
    const currentValuesV = windValuesU.map((value) => value * 2);
    const weatherWindU = windValuesU.map((value) => new Int8Array(size).fill(value));
    const weatherWindV = windValuesV.map((value) => new Int8Array(size).fill(value));
    const weatherCurrentU = currentValuesU.map((value) => new Int8Array(size).fill(value));
    const weatherCurrentV = currentValuesV.map((value) => new Int8Array(size).fill(value));
    const seasonMeansForAtmosphere = (
      values: readonly number[],
      atmosphereIndex: number
    ): number[] => {
      const start = atmosphereIndex * modeCount * 2;
      return Array.from({ length: modeCount }, (_, seasonIndex) => {
        const memberStart = start + seasonIndex * 2;
        return Math.round(
          ((values[memberStart] ?? 0) + (values[memberStart + 1] ?? 0)) / 2
        );
      });
    };
    const atmosphereMean = (values: readonly number[], atmosphereIndex: number): number => {
      const seasonMeans = seasonMeansForAtmosphere(values, atmosphereIndex);
      return Math.round(
        seasonMeans.reduce((sum, value) => sum + value, 0) / seasonMeans.length
      );
    };
    const sstByIteration = Array.from({ length: couplingIterations }, (_, iteration) =>
      new Float32Array(size).fill(20 + iteration)
    );
    const currentInputs: Array<{
      windU: ArrayLike<number>;
      windV: ArrayLike<number>;
    }> = [];
    const oceanThermalInputs: Array<{
      currentU: ArrayLike<number>;
      currentV: ArrayLike<number>;
    }> = [];
    const thermalInputs: Array<{
      sstC: ArrayLike<number> | undefined;
      elevation: ArrayLike<number>;
      output: Float32Array;
    }> = [];
    const pressureInputs: PressureFieldInput[] = [];
    const pressureOutputs: Float32Array[] = [];
    const circulationPressureInputs: Array<ArrayLike<number> | undefined> = [];
    const circulationInputs: AtmosphericCirculationInput[] = [];
    const precipitationInputs: PrecipitationInput[] = [];
    let currentCall = 0;
    let currentField:
      | Readonly<{
          currentU: ArrayLike<number>;
          currentV: ArrayLike<number>;
        }>
        | undefined;
    let observedSeasonalPressure: readonly Float32Array[] = [];
    let observedSeasonalWindU: readonly Int8Array[] = [];
    let observedSeasonalWindV: readonly Int8Array[] = [];
    let observedSeasonalCurrentU: readonly Int8Array[] = [];
    let observedSeasonalCurrentV: readonly Int8Array[] = [];
    let observedSeasonalRainfall: readonly Uint8Array[] = [];
    let observedSeasonalHumidity: readonly Uint8Array[] = [];

    withMapContextExecutionForTest(context, (stepContext) => {
      const dependencies = buildStepTestDependencies(ClimateBaselineStep, stepContext);
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: topographyElevation,
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
          computePressureField: (input: PressureFieldInput) => {
            const thermalSampleIndex = Math.floor(pressureInputs.length / 2);
            pressureInputs.push(input);
            const pressure = new Float32Array(size).fill(
              thermalSampleIndex + 1 + (input.transientPolarity ?? 0) * 0.25
            );
            pressureOutputs.push(pressure);
            return { pressure };
          },
          computeAtmosphericCirculation: (input: AtmosphericCirculationInput) => {
            const call = circulationInputs.length;
            circulationInputs.push(input);
            circulationPressureInputs.push(input.pressureField);
            return {
              windU: weatherWindU[call]!,
              windV: weatherWindV[call]!,
            };
          },
          computeOceanSurfaceCurrents: (input: OceanCurrentsInput) => {
            currentInputs.push({ windU: input.windU, windV: input.windV });
            const output = {
              currentU: weatherCurrentU[currentCall]!,
              currentV: weatherCurrentV[currentCall]!,
            };
            currentCall += 1;
            return output;
          },
          computeOceanThermalState: (input: OceanThermalInput) => {
            const iteration = oceanThermalInputs.length;
            oceanThermalInputs.push({
              currentU: input.currentU,
              currentV: input.currentV,
            });
            return {
              sstC: sstByIteration[iteration]!,
              seaIceMask: new Uint8Array(size),
            };
          },
          computeRadiativeForcing: () => ({ insolation: new Float32Array(size) }),
          computeThermalState: (input: ThermalStateInput) => {
            const output = new Float32Array(size).fill(thermalInputs.length + 1);
            thermalInputs.push({
              sstC: input.sstC,
              elevation: input.elevation,
              output,
            });
            return { surfaceTemperatureC: output };
          },
          computeEvaporationSources: () => ({ evaporation: new Float32Array(size) }),
          transportMoisture: () => ({ humidity: new Float32Array(size) }),
          computePrecipitation: (input: PrecipitationInput) => {
            precipitationInputs.push(input);
            return {
              rainfall: new Uint8Array(size).fill(Math.abs(input.windU[0] ?? 0)),
              humidity: new Uint8Array(size).fill(Math.abs(input.windV[0] ?? 0)),
            };
          },
        },
        dependencies
      );
      if (result instanceof Promise) {
        throw new Error("Climate baseline composition is synchronous in the Standard recipe.");
      }
      currentField = result.currentField;
      observedSeasonalPressure = result.seasonalPressure;
      observedSeasonalWindU = result.seasonalWindU;
      observedSeasonalWindV = result.seasonalWindV;
      observedSeasonalCurrentU = result.seasonalCurrentU;
      observedSeasonalCurrentV = result.seasonalCurrentV;
      observedSeasonalRainfall = result.seasonalRainfall;
      observedSeasonalHumidity = result.seasonalHumidity;
    });

    expect(currentInputs).toHaveLength(weatherCalls);
    for (let call = 0; call < weatherCalls; call++) {
      expect(currentInputs[call]!.windU).toBe(weatherWindU[call]);
      expect(currentInputs[call]!.windV).toBe(weatherWindV[call]);
    }

    expect(pressureInputs).toHaveLength(weatherCalls);
    expect(circulationInputs).toHaveLength(weatherCalls);
    expect(circulationPressureInputs).toHaveLength(weatherCalls);
    for (let seasonCall = 0; seasonCall < atmosphereSeasonCalls; seasonCall++) {
      const positiveCall = seasonCall * 2;
      const negativeCall = positiveCall + 1;
      const positive = pressureInputs[positiveCall]!;
      const negative = pressureInputs[negativeCall]!;
      expect([positive.transientPolarity, negative.transientPolarity]).toEqual([1, -1]);
      expect(positive.seasonSalt).toBe(negative.seasonSalt);
      expect(positive.seasonSalt).toBeGreaterThanOrEqual(0);
      expect(positive.surfaceTemperatureC).toBe(thermalInputs[seasonCall]!.output);
      expect(negative.surfaceTemperatureC).toBe(thermalInputs[seasonCall]!.output);
      for (const call of [positiveCall, negativeCall]) {
        expect("elevation" in pressureInputs[call]!).toBeFalse();
        expect("elevationScale" in pressureInputs[call]!).toBeFalse();
        expect("seasonSalt" in circulationInputs[call]!).toBeFalse();
        expect(circulationInputs[call]!.rngSeed).toBe(pressureInputs[call]!.rngSeed);
        expect(circulationPressureInputs[call]).toBe(pressureOutputs[call]);
      }
    }

    expect(thermalInputs).toHaveLength(atmosphereSeasonCalls + modeCount);
    for (let iteration = 0; iteration < couplingIterations; iteration++) {
      const expectedSst = iteration === 0 ? undefined : sstByIteration[iteration - 1];
      for (let season = 0; season < modeCount; season++) {
        const thermal = thermalInputs[iteration * modeCount + season]!;
        expect(thermal.elevation).not.toBe(topographyElevation);
        expect(thermal.sstC).toBe(expectedSst);
      }
    }
    for (let call = cycleSeasonCalls; call < atmosphereSeasonCalls; call++) {
      expect(thermalInputs[call]!.elevation).not.toBe(topographyElevation);
      expect(thermalInputs[call]!.sstC).toBe(sstByIteration[couplingIterations - 1]);
    }
    for (let call = atmosphereSeasonCalls; call < atmosphereSeasonCalls + modeCount; call++) {
      expect(thermalInputs[call]!.elevation).toBe(topographyElevation);
      expect(thermalInputs[call]!.sstC).toBe(sstByIteration[couplingIterations - 1]);
    }

    expect(oceanThermalInputs).toHaveLength(couplingIterations);
    for (let iteration = 0; iteration < couplingIterations; iteration++) {
      expect(Array.from(oceanThermalInputs[iteration]!.currentU)).toEqual(
        Array.from(new Int8Array(size).fill(atmosphereMean(currentValuesU, iteration)))
      );
      expect(Array.from(oceanThermalInputs[iteration]!.currentV)).toEqual(
        Array.from(new Int8Array(size).fill(atmosphereMean(currentValuesV, iteration)))
      );
    }

    const finalAtmosphere = couplingIterations;
    const windField = readArtifact(context, climateArtifacts.windField);
    expect(Array.from(windField.windU)).toEqual(
      Array.from(new Int8Array(size).fill(atmosphereMean(windValuesU, finalAtmosphere)))
    );
    expect(Array.from(windField.windV)).toEqual(
      Array.from(new Int8Array(size).fill(atmosphereMean(windValuesV, finalAtmosphere)))
    );
    expect(Array.from(currentField?.currentU ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(atmosphereMean(currentValuesU, finalAtmosphere)))
    );
    expect(Array.from(currentField?.currentV ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(atmosphereMean(currentValuesV, finalAtmosphere)))
    );

    const finalPressureOutputs = pressureOutputs.slice(-(modeCount * 2));
    const expectedSeasonalPressure = Array.from({ length: modeCount }, (_, seasonIndex) => {
      const memberStart = seasonIndex * 2;
      const positive = finalPressureOutputs[memberStart]![0] ?? 0;
      const negative = finalPressureOutputs[memberStart + 1]![0] ?? 0;
      return (positive + negative) / 2;
    });
    expect(observedSeasonalPressure).toHaveLength(modeCount);
    for (let season = 0; season < modeCount; season++) {
      expect(Array.from(observedSeasonalPressure[season] ?? [])).toEqual(
        Array.from(new Float32Array(size).fill(expectedSeasonalPressure[season]!))
      );
    }
    const expectedAnnualPressure =
      expectedSeasonalPressure.reduce((sum, pressure) => sum + pressure, 0) / modeCount;
    const pressureField = readArtifact(context, climateArtifacts.pressureField);
    expect(Array.from(pressureField.pressure)).toEqual(
      Array.from(new Float32Array(size).fill(expectedAnnualPressure))
    );

    const expectedSeasonalWindU = seasonMeansForAtmosphere(windValuesU, finalAtmosphere);
    const expectedSeasonalWindV = seasonMeansForAtmosphere(windValuesV, finalAtmosphere);
    const expectedSeasonalCurrentU = seasonMeansForAtmosphere(currentValuesU, finalAtmosphere);
    const expectedSeasonalCurrentV = seasonMeansForAtmosphere(currentValuesV, finalAtmosphere);
    for (const fields of [
      observedSeasonalWindU,
      observedSeasonalWindV,
      observedSeasonalCurrentU,
      observedSeasonalCurrentV,
      observedSeasonalRainfall,
      observedSeasonalHumidity,
    ]) {
      expect(fields).toHaveLength(modeCount);
    }
    for (let season = 0; season < modeCount; season++) {
      expect(Array.from(observedSeasonalWindU[season] ?? [])).toEqual(
        Array.from(new Int8Array(size).fill(expectedSeasonalWindU[season]!))
      );
      expect(Array.from(observedSeasonalWindV[season] ?? [])).toEqual(
        Array.from(new Int8Array(size).fill(expectedSeasonalWindV[season]!))
      );
      expect(Array.from(observedSeasonalCurrentU[season] ?? [])).toEqual(
        Array.from(new Int8Array(size).fill(expectedSeasonalCurrentU[season]!))
      );
      expect(Array.from(observedSeasonalCurrentV[season] ?? [])).toEqual(
        Array.from(new Int8Array(size).fill(expectedSeasonalCurrentV[season]!))
      );
      expect(Array.from(observedSeasonalRainfall[season] ?? [])).toEqual(
        Array.from(new Uint8Array(size).fill(expectedSeasonalWindU[season]!))
      );
      expect(Array.from(observedSeasonalHumidity[season] ?? [])).toEqual(
        Array.from(new Uint8Array(size).fill(expectedSeasonalWindU[season]!))
      );
    }
    expect(precipitationInputs).toHaveLength(modeCount * 2);
  });

  it("returns zero seasonal amplitude when axial tilt disables seasonal forcing", () => {
    const evidence = captureSeasonalEvidence(0);

    expect(evidence.axialTiltDeg).toBe(0);
    expect(evidence.seasonSalts).toEqual(
      new Array(evidence.modeCount * (evidence.couplingIterations + 1) * 2).fill(0)
    );
    expect(evidence.transientPolarities).toEqual(
      Array.from(
        { length: evidence.modeCount * (evidence.couplingIterations + 1) },
        () => [1, -1]
      ).flat()
    );
    expect(new Set(evidence.circulationTopLatitudes).size).toBe(1);
    expect(evidence.seasonalFieldCounts).toEqual(new Array(7).fill(evidence.modeCount));
    expect(Array.from(evidence.rainfallAmplitude).every((value) => value === 0)).toBeTrue();
    expect(Array.from(evidence.humidityAmplitude).every((value) => value === 0)).toBeTrue();
  });

  it("returns nonzero seasonal amplitude when axial tilt enables seasonal forcing", () => {
    const evidence = captureSeasonalEvidence(18);

    expect(evidence.axialTiltDeg).toBe(18);
    expect(new Set(evidence.seasonSalts).size).toBe(evidence.modeCount);
    expect(evidence.transientPolarities).toEqual(
      Array.from(
        { length: evidence.modeCount * (evidence.couplingIterations + 1) },
        () => [1, -1]
      ).flat()
    );
    expect(new Set(evidence.circulationTopLatitudes).size).toBeGreaterThan(1);
    expect(evidence.seasonalFieldCounts).toEqual(new Array(7).fill(evidence.modeCount));
    expect(Array.from(evidence.rainfallAmplitude).some((value) => value > 0)).toBeTrue();
    expect(Array.from(evidence.humidityAmplitude).some((value) => value > 0)).toBeTrue();
  });
});
