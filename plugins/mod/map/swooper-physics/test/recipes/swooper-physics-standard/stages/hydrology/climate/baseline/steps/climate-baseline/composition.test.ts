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
type OceanGeometryInput = Parameters<typeof hydrologyDomain.ocean.ops.computeOceanGeometry.run>[0];
type MoistureInput = Parameters<typeof hydrologyDomain.climate.ops.transportMoisture.run>[0];
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
type PotentialDemandInput = Parameters<
  typeof hydrologyDomain.climate.ops.computePotentialDemand.run
>[0];

const aggregateOps = {
  computeSeasonalSampling: hydrologyDomain.climate.ops.computeSeasonalSampling.run,
  computeAtmosphericAggregate: hydrologyDomain.climate.ops.computeAtmosphericAggregate.run,
  computeMoistureAggregate: hydrologyDomain.climate.ops.computeMoistureAggregate.run,
};

function climateBaselineConfig(
  options: Readonly<{ axialTiltDeg?: number }> = {}
) {
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

function capturePeriodicComposition(modeCount: 2 | 4, axialTiltDeg?: number) {
  const width = 4,
    height = 3,
    size = width * height;
  const config = climateBaselineConfig({ axialTiltDeg });
  config.seasonality.modeCount = modeCount;
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 50, bottomLatitude: -50 },
    }),
    adapter: createMockAdapter({ width, height }),
  });
  const events: string[] = [];
  const geometryInputs: OceanGeometryInput[] = [];
  const oceanInputs: OceanThermalInput[] = [];
  const thermalInputs: ThermalStateInput[] = [];
  const thermalOutputs: Extract<
    ReturnType<typeof hydrologyDomain.climate.ops.computeThermalState.run>,
    { model: "periodic-response" }
  >[] = [];
  const pressureInputs: PressureFieldInput[] = [];
  const pressureOutputs: Float32Array[] = [];
  const circulationInputs: AtmosphericCirculationInput[] = [];
  const windOutputs: ReturnType<typeof hydrologyDomain.climate.ops.computeAtmosphericCirculation.run>[] = [];
  const currentInputs: OceanCurrentsInput[] = [];
  const currentOutputs: ReturnType<typeof hydrologyDomain.ocean.ops.computeOceanSurfaceCurrents.run>[] = [];
  const precipitationInputs: PrecipitationInput[] = [];
  const precipitationOutputs: ReturnType<typeof hydrologyDomain.climate.ops.computePrecipitation.run>[] = [];
  const evaporationInputs: Parameters<typeof hydrologyDomain.climate.ops.computeEvaporationSources.run>[0][] = [];
  const moistureInputs: MoistureInput[] = [];
  const demandInputs: PotentialDemandInput[] = [];
  const demandOutputs: number[][] = [];
  const landMask = new Uint8Array(size).fill(1);
  landMask[0] = 0;
  const elevation = new Int16Array(size).fill(100);
  elevation[0] = 0;
  const externalWaterMask = new Uint8Array(size);
  externalWaterMask[0] = 1;
  let observation: ReturnType<typeof ClimateBaselineStep.run> | undefined;
  withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, morphologyLandformsArtifacts.initialTopography, {
      elevation,
      seaLevel: 0,
      landMask,
      externalWaterMask,
      bathymetry: new Int16Array(size),
    });
    publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, {
      shelfMask: new Uint8Array(size),
      coastalLand: new Uint8Array(size),
      coastalWater: new Uint8Array(size),
      distanceToCoast: new Uint16Array(size),
    });
    observation = ClimateBaselineStep.run(
      stepContext,
      config,
      {
        ...aggregateOps,
        computeRadiativeForcing: hydrologyDomain.climate.ops.computeRadiativeForcing.run,
        computeThermalState: (
          input: ThermalStateInput,
          thermalConfig: Parameters<typeof hydrologyDomain.climate.ops.computeThermalState.run>[1]
        ) => {
          events.push("thermal");
          thermalInputs.push(input);
          const output = hydrologyDomain.climate.ops.computeThermalState.run(input, thermalConfig);
          thermalOutputs.push(output);
          return output;
        },
        computeOceanGeometry: (input: OceanGeometryInput) => {
          geometryInputs.push(input);
          return {
            basinId: new Int32Array(size),
            coastDistance: new Uint16Array(size),
            coastNormalU: new Int8Array(size),
            coastNormalV: new Int8Array(size),
            coastTangentU: new Int8Array(size),
            coastTangentV: new Int8Array(size),
          };
        },
        computeOceanThermalState: (input: OceanThermalInput) => {
          events.push("ocean");
          oceanInputs.push(input);
          return {
            sstC: new Float32Array(size).fill(10 + oceanInputs.length),
            seaIceMask: new Uint8Array(size),
          };
        },
        computePressureField: (input: PressureFieldInput) => {
          const vintage = Math.floor(pressureInputs.length / (config.computeSeasonalSampling.config.phaseCount * 2));
          pressureInputs.push(input);
          const pressure = Float32Array.from(
              input.surfaceTemperatureC,
              (value, index) => value - input.meanSurfaceTemperatureC[index]! + vintage * 2 + (input.transientPolarity ?? 0) * 0.25
            );
          pressureOutputs.push(pressure);
          return { pressure };
        },
        computeAtmosphericCirculation: (input: AtmosphericCirculationInput) => {
          const member = circulationInputs.length % 2;
          const vintage = Math.floor(circulationInputs.length / (config.computeSeasonalSampling.config.phaseCount * 2));
          circulationInputs.push(input);
          const signal = Math.round((input.latitudeByRow[0]! + 90) / 4) + member + vintage * 3;
          const output = {
            windU: new Int8Array(size).fill(signal),
            windV: new Int8Array(size).fill(-signal),
          };
          windOutputs.push(output);
          return output;
        },
        computeOceanSurfaceCurrents: (input: OceanCurrentsInput) => {
          currentInputs.push(input);
          const output = {
            currentU: Int8Array.from(input.windU, (value) => value * 2),
            currentV: Int8Array.from(input.windV),
          };
          currentOutputs.push(output);
          return output;
        },
        computeEvaporationSources: (input: Parameters<typeof hydrologyDomain.climate.ops.computeEvaporationSources.run>[0]) => {
          evaporationInputs.push(input);
          return { evaporation: new Float32Array(size) };
        },
        transportMoisture: (input: MoistureInput) => {
          moistureInputs.push(input);
          return { humidity: new Float32Array(size) };
        },
        computePrecipitation: (input: PrecipitationInput) => {
          precipitationInputs.push(input);
          const output = {
            rainfall: Uint8Array.from(input.windU, Math.abs),
            humidity: Uint8Array.from(input.windV, Math.abs),
          };
          precipitationOutputs.push(output);
          return output;
        },
        computePotentialDemand: (
          input: PotentialDemandInput,
          demandConfig: Parameters<typeof hydrologyDomain.climate.ops.computePotentialDemand.run>[1]
        ) => {
          demandInputs.push(input);
          const output = hydrologyDomain.climate.ops.computePotentialDemand.run(input, demandConfig);
          demandOutputs.push(output.pet);
          return output;
        },
      },
      buildStepTestDependencies(ClimateBaselineStep, stepContext)
    );
  });
  if (!observation || observation instanceof Promise)
    throw new Error("Expected synchronous periodic climate.");
  return {
    observation,
    context,
    landMask,
    elevation,
    config,
    events,
    geometryInputs,
    oceanInputs,
    thermalInputs,
    thermalOutputs,
    pressureInputs,
    pressureOutputs,
    circulationInputs,
    windOutputs,
    currentInputs,
    currentOutputs,
    precipitationInputs,
    precipitationOutputs,
    evaporationInputs,
    moistureInputs,
    demandInputs,
    demandOutputs,
  };
}

describe("hydrology climate-baseline composition", () => {
  it("maps periodic temperature knobs only to the explicit annual offset", () => {
    const config = climateBaselineConfig();
    const knobs = createStandardRecipeTestConfig()["hydrology-climate-baseline"].knobs;
    if (config.computeThermalState.strategy !== "periodic-response")
      throw new Error("Expected periodic configuration.");
    for (const [temperature, offset] of [
      ["cold", -5],
      ["temperate", 0],
      ["hot", 5],
    ] as const) {
      const normalized = validateSchemaValueForTest(
        climateBaselineStepConfig.schema,
        ClimateBaselineStep.normalize!(config, { setup, knobs: { ...knobs, temperature } }),
        "/periodic/temperature-knob"
      );
      expect(normalized.computeThermalState).toEqual({
        ...config.computeThermalState,
        config: {
          ...config.computeThermalState.config,
          annualOffsetC: config.computeThermalState.config.annualOffsetC + offset,
        },
      });
      expect(normalized.computeRadiativeForcing).toEqual(config.computeRadiativeForcing);
      expect(normalized.computeSeasonalSampling).toEqual(config.computeSeasonalSampling);
    }
  });

  it("initializes prescribed SST and reuses one periodic family per complete coupling vintage", () => {
    const run = capturePeriodicComposition(4);
    const phaseCount = 24,
      vintages = run.config.coupling.iterations + 1;
    expect(run.events[0]).toBe("ocean");
    expect(run.events.at(-1)).toBe("thermal");
    expect(run.geometryInputs).toHaveLength(1);
    expect(run.observation.oceanGeometry).toBeDefined();
    expect(run.oceanInputs).toHaveLength(vintages);
    expect([...run.oceanInputs[0]!.currentU]).toEqual(new Array(12).fill(0));
    expect(run.thermalInputs).toHaveLength(vintages);
    expect(run.pressureInputs).toHaveLength(vintages * phaseCount * 2);
    for (let vintage = 0; vintage < vintages; vintage++) {
      const family = run.thermalOutputs[vintage]!;
      expect(run.thermalInputs[vintage]!.sstC[0]).toBe(11 + vintage);
      for (let phase = 0; phase < phaseCount; phase++) {
        const input = run.pressureInputs[(vintage * phaseCount + phase) * 2]!;
        expect(input.surfaceTemperatureC).toBe(family.samples[phase]!.seaLevelTemperatureC);
        expect(input.meanSurfaceTemperatureC).toBe(family.meanSeaLevelTemperatureC);
      }
    }
    const final = run.thermalOutputs.at(-1)!;
    expect(run.demandInputs).toHaveLength(phaseCount);
    for (let phase = 0; phase < phaseCount; phase++) {
      expect(run.demandInputs[phase]!.surfaceTemperatureC).toBe(
        final.samples[phase]!.surfaceTemperatureC
      );
    }
    expect(run.observation.thermalField.surfaceTemperatureC).toEqual(
      final.annualSurfaceTemperatureC
    );
    expect(run.observation.seasonalIntegration.rainfall).toHaveLength(phaseCount);
    expect(run.observation.seasonalSurfaceTemperatureC).toHaveLength(4);
  });

  it("refuses retired selectors and controls at the current step boundary", () => {
    const config = climateBaselineConfig();
    for (const [key, retired] of [
      ["computeSeasonalSampling", { strategy: "legacy-snapshots", config: {} }],
      ["computeRadiativeForcing", { strategy: "latitude-insolation", config: {} }],
      ["computeThermalState", { strategy: "insolation-lapse-rate", config: {} }],
      ["computeAtmosphericCirculation", {
        strategy: "latitude",
        config: { windJetStreaks: 0, windJetStrength: 0, windVariance: 0 },
      }],
      ["computeOceanSurfaceCurrents", { strategy: "latitude", config: { strength: 0 } }],
      ["transportMoisture", {
        strategy: "cardinal", config: { iterations: 0, advection: 0.65, retention: 0.92 },
      }],
      ["computePrecipitation", {
        strategy: "baseline",
        config: {
          rainfallScale: 180, humidityExponent: 1, noiseAmplitude: 0, noiseScale: 0.12,
          waterGradient: { radius: 5, perRingBonus: 4, lowlandBonus: 2, lowlandElevationMax: 150 },
          orographic: { steps: 4, reductionBase: 8, reductionPerStep: 6, barrierElevationM: 500 },
        },
      }],
      ["computeRadiativeForcing", { ...config.computeRadiativeForcing, config: { equatorInsolation: 1 } }],
      ["computeThermalState", { ...config.computeThermalState, config: { ...config.computeThermalState.config, baseTemperatureC: 9 } }],
    ] as const) {
      expect(() => validateSchemaValueForTest(
        climateBaselineStepConfig.schema, { ...config, [key]: retired }, "/retired-climate"
      )).toThrow();
    }
  });

  it("refuses the four retired selectors at operation admission", () => {
    for (const [schema, retired] of [
      [hydrologyDomain.climate.ops.computeAtmosphericCirculation.config, {
        strategy: "latitude",
        config: { windJetStreaks: 0, windJetStrength: 0, windVariance: 0 },
      }],
      [hydrologyDomain.ocean.ops.computeOceanSurfaceCurrents.config, {
        strategy: "latitude", config: { strength: 0 },
      }],
      [hydrologyDomain.climate.ops.transportMoisture.config, {
        strategy: "cardinal", config: { iterations: 0, advection: 0.65, retention: 0.92 },
      }],
      [hydrologyDomain.climate.ops.computePrecipitation.config, {
        strategy: "baseline",
        config: {
          rainfallScale: 180, humidityExponent: 1, noiseAmplitude: 0, noiseScale: 0.12,
          waterGradient: { radius: 5, perRingBonus: 4, lowlandBonus: 2, lowlandElevationMax: 150 },
          orographic: { steps: 4, reductionBase: 8, reductionPerStep: 6, barrierElevationM: 500 },
        },
      }],
    ] as const) {
      expect(() => validateSchemaValueForTest(schema, retired, "/retired-climate-operation")).toThrow();
    }
  });

  it("publishes only the final complete pressure-wind-current vintage and ground PET", () => {
    const run = capturePeriodicComposition(4);
    const { phases, weights, observationIndices } = run.observation.seasonalIntegration;
    const phaseCount = phases.length;
    const vintages = run.config.coupling.iterations + 1;
    for (let vintage = 0; vintage < vintages; vintage++) {
      expect(run.thermalInputs[vintage]!.elevation).toBe(run.elevation);
      expect(run.thermalInputs[vintage]!.landMask).toBe(run.landMask);
      for (let phase = 0; phase < phaseCount; phase++) {
        const first = (vintage * phaseCount + phase) * 2;
        const positive = run.pressureInputs[first]!;
        const negative = run.pressureInputs[first + 1]!;
        expect([positive.transientPolarity, negative.transientPolarity]).toEqual([1, -1]);
        expect(positive.seasonSalt).toBe(negative.seasonSalt);
        expect(positive.rngSeed).toBe(negative.rngSeed);
        expect(negative.surfaceTemperatureC).toBe(positive.surfaceTemperatureC);
        for (const call of [first, first + 1]) {
          expect("elevation" in run.pressureInputs[call]!).toBe(false);
          expect("elevationScale" in run.pressureInputs[call]!).toBe(false);
          expect("seasonSalt" in run.circulationInputs[call]!).toBe(false);
          expect("rngSeed" in run.circulationInputs[call]!).toBe(false);
          expect(run.circulationInputs[call]!.pressureField).toBe(run.pressureOutputs[call]);
          expect(run.currentInputs[call]!.windU).toBe(run.windOutputs[call]!.windU);
          expect(run.currentInputs[call]!.windV).toBe(run.windOutputs[call]!.windV);
          expect(run.currentInputs[call]!.basinId).toBe(run.observation.oceanGeometry.basinId);
          expect(run.currentInputs[call]!.coastDistance).toBe(run.observation.oceanGeometry.coastDistance);
          expect(run.currentInputs[call]!.coastTangentU).toBe(run.observation.oceanGeometry.coastTangentU);
          expect(run.currentInputs[call]!.coastTangentV).toBe(run.observation.oceanGeometry.coastTangentV);
        }
      }
      if (vintage > 0) {
        const start = (vintage - 1) * phaseCount * 2;
        const samples = Array.from({ length: phaseCount }, (_, phase) => hydrologyDomain.climate.ops.computeAtmosphericAggregate.run({
          width: 4, height: 3, reduction: "weather-members",
          samples: [0, 1].map((member) => ({
            pressure: run.pressureOutputs[start + phase * 2 + member]!,
            ...run.windOutputs[start + phase * 2 + member]!,
            ...run.currentOutputs[start + phase * 2 + member]!,
          })),
        }, run.config.computeAtmosphericAggregate));
        const previous = hydrologyDomain.climate.ops.computeAtmosphericAggregate.run({
          width: 4, height: 3, reduction: "annual", model: "periodic-cycle", weights,
          samples: samples.map(({ reduction, ...sample }) => sample),
        }, run.config.computeAtmosphericAggregate);
        expect(run.oceanInputs[vintage]!.currentU).toEqual(previous.currentU);
        expect(run.oceanInputs[vintage]!.currentV).toEqual(previous.currentV);
      }
    }
    const start = (vintages - 1) * phaseCount * 2;
    const finalAtmosphere = Array.from({ length: phaseCount }, (_, phase) => hydrologyDomain.climate.ops.computeAtmosphericAggregate.run({
      width: 4, height: 3, reduction: "weather-members",
      samples: [0, 1].map((member) => ({
        pressure: run.pressureOutputs[start + phase * 2 + member]!,
        ...run.windOutputs[start + phase * 2 + member]!,
        ...run.currentOutputs[start + phase * 2 + member]!,
      })),
    }, run.config.computeAtmosphericAggregate));
    const finalAnnual = hydrologyDomain.climate.ops.computeAtmosphericAggregate.run({
      width: 4, height: 3, reduction: "annual", model: "periodic-cycle", weights,
      samples: finalAtmosphere.map(({ reduction, ...sample }) => sample),
    }, run.config.computeAtmosphericAggregate);
    expect(run.observation.pressureField.pressure).toEqual(finalAnnual.pressure);
    expect(run.observation.windField).toEqual({ windU: finalAnnual.windU, windV: finalAnnual.windV });
    expect(run.observation.currentField).toEqual({ currentU: finalAnnual.currentU, currentV: finalAnnual.currentV });
    expect(run.pressureOutputs[start]).not.toEqual(run.pressureOutputs[0]);
    expect(run.windOutputs[start]).not.toEqual(run.windOutputs[0]);
    expect(run.currentOutputs[start]).not.toEqual(run.currentOutputs[0]);
    const finalSamples = Array.from({ length: phaseCount }, (_, phase) => {
      for (const member of [0, 1]) {
        expect(run.precipitationInputs[phase * 2 + member]!.windU).toBe(run.windOutputs[start + phase * 2 + member]!.windU);
        const evaporation = run.evaporationInputs[phase * 2 + member]!;
        if (evaporation.windU === undefined || evaporation.windV === undefined) {
          throw new Error("Expected final weather-member winds at evaporation.");
        }
        expect(evaporation.windU).toBe(run.windOutputs[start + phase * 2 + member]!.windU);
        expect(evaporation.windV).toBe(run.windOutputs[start + phase * 2 + member]!.windV);
        expect(evaporation.sstC).toBe(run.thermalInputs.at(-1)!.sstC);
        expect(evaporation.seaIceMask).toBe(run.observation.oceanThermal.seaIceMask);
        expect(evaporation.surfaceTemperatureC).toBe(run.thermalOutputs.at(-1)!.samples[phase]!.surfaceTemperatureC);
        expect(evaporation.landMask).toBe(run.landMask);
        const transport = run.moistureInputs[phase * 2 + member]!;
        expect(Object.keys(transport).sort()).toEqual(["evaporation", "height", "width", "windU", "windV"]);
        expect(transport.windU).toBe(evaporation.windU);
        expect(transport.windV).toBe(evaporation.windV);
      }
      const moisture = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
        width: 4, height: 3, reduction: "weather-members",
        samples: run.precipitationOutputs.slice(phase * 2, phase * 2 + 2),
      }, run.config.computeMoistureAggregate);
      expect(run.demandInputs[phase]!.humidity).toEqual(moisture.humidity);
      expect(run.demandInputs[phase]!.humidity).toBe(run.observation.seasonalIntegration.humidity[phase]);
      expect(Object.hasOwn(run.demandInputs[phase]!, "landMask")).toBe(false);
      expect(run.demandInputs[phase]!.parameters).toEqual(run.config.potentialDemand);
      expect(run.demandOutputs[phase]![0]).toBeGreaterThan(0);
      return { rainfall: moisture.rainfall, humidity: moisture.humidity, potentialDemand: run.demandOutputs[phase]! };
    });
    const annual = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
      width: 4, height: 3, reduction: "annual", model: "periodic-cycle", weights, samples: finalSamples,
    }, run.config.computeMoistureAggregate);
    if (annual.reduction !== "annual") {
      throw new Error("Expected annual moisture reduction.");
    }
    expect(run.observation.baselineClimateField.rainfall).toEqual(annual.rainfall);
    expect(run.observation.baselineClimateField.humidity).toEqual(annual.humidity);
    expect(run.observation.baselineClimateField.potentialDemand).toEqual(annual.potentialDemand);
    expect(annual.potentialDemand[0]).toBeGreaterThan(0);
    expect(run.observation.baselineClimateField.demandParameters).toEqual(run.config.potentialDemand);
    expect(readArtifact(run.context, climateArtifacts.thermalField)).toEqual(run.observation.thermalField);
    for (let index = 0; index < observationIndices.length; index++) {
      const phase = observationIndices[index]!;
      expect(run.observation.seasonalRainfall[index]).toBe(run.observation.seasonalIntegration.rainfall[phase]);
      expect(run.observation.seasonalSurfaceTemperatureC[index]).toBe(run.thermalOutputs.at(-1)!.samples[phase]!.surfaceTemperatureC);
      expect(run.observation.seasonalPressure[index]).toEqual(finalAtmosphere[phase]!.pressure);
      expect(run.observation.seasonalWindU[index]).toEqual(finalAtmosphere[phase]!.windU);
      expect(run.observation.seasonalWindV[index]).toEqual(finalAtmosphere[phase]!.windV);
      expect(run.observation.seasonalCurrentU[index]).toEqual(finalAtmosphere[phase]!.currentU);
      expect(run.observation.seasonalCurrentV[index]).toEqual(finalAtmosphere[phase]!.currentV);
    }
  });

  it("retains zero-tilt salts and zero amplitudes without erasing weather members", () => {
    for (const axialTiltDeg of [0, 18]) {
      const run = capturePeriodicComposition(4, axialTiltDeg);
      const phaseCount = run.observation.seasonalIntegration.phases.length;
      const salts = new Set(run.pressureInputs.map((input) => input.seasonSalt));
      const latitudes = new Set(run.circulationInputs.map((input) => input.latitudeByRow[0]));
      expect(salts.size).toBe(axialTiltDeg === 0 ? 1 : phaseCount);
      if (axialTiltDeg === 0) expect([...salts]).toEqual([0]);
      if (axialTiltDeg === 0) expect(latitudes.size).toBe(1);
      else expect(latitudes.size).toBeGreaterThan(1);
      for (const amplitudes of Object.values(run.observation.seasonalAmplitudes)) {
        expect(Array.from(amplitudes).some((value) => value > 0)).toBe(axialTiltDeg !== 0);
      }
      for (const fields of [
        run.observation.seasonalRainfall, run.observation.seasonalHumidity,
        run.observation.seasonalSurfaceTemperatureC, run.observation.seasonalPressure,
        run.observation.seasonalWindU, run.observation.seasonalWindV,
        run.observation.seasonalCurrentU, run.observation.seasonalCurrentV,
      ]) expect(fields).toHaveLength(4);
    }
  });

  it("keeps all annual fields independent of observation count", () => {
    const two = capturePeriodicComposition(2),
      four = capturePeriodicComposition(4);
    for (const key of [
      "baselineClimateField",
      "thermalField",
      "pressureField",
      "windField",
      "currentField",
      "seasonalAmplitudes",
      "thermalResponse",
    ] as const) {
      expect(two.observation[key]).toEqual(four.observation[key]);
    }
    expect(two.observation.seasonalSurfaceTemperatureC).toEqual([
      four.observation.seasonalSurfaceTemperatureC[1]!,
      four.observation.seasonalSurfaceTemperatureC[3]!,
    ]);
  });

});
