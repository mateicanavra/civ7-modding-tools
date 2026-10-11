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
type ThermalStateInput = Parameters<typeof hydrologyDomain.climate.ops.computeThermalState.run>[0];
type PressureFieldInput = Parameters<
  typeof hydrologyDomain.climate.ops.computePressureField.run
>[0];
type AtmosphericCirculationInput = Parameters<
  typeof hydrologyDomain.climate.ops.computeAtmosphericCirculation.run
>[0];
type PrecipitationInput = Parameters<
  typeof hydrologyDomain.climate.ops.computeMoistureForcing.run
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

function capturePeriodicComposition(
  modeCount: 2 | 4,
  axialTiltDeg?: number,
  options: Readonly<{
    regionalGainC?: number;
    couplingIterations?: 1 | 2 | 3 | 4;
    spatialMoisture?: boolean;
    zeroDemand?: boolean;
  }> = {}
) {
  const width = 4,
    height = 3,
    size = width * height;
  const config = climateBaselineConfig({ axialTiltDeg });
  config.seasonality.modeCount = modeCount;
  config.regionalResponse.gainC = options.regionalGainC ?? 0;
  if (options.couplingIterations !== undefined) config.coupling.iterations = options.couplingIterations;
  if (options.zeroDemand) {
    config.potentialDemand.petBase = 0;
    config.potentialDemand.petTemperatureWeight = 0;
  }
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 50, bottomLatitude: -50 },
    }),
    adapter: createMockAdapter({ width, height }),
  });
  const events: string[] = [];
  const operationTrace: string[] = [];
  const publications: string[] = [];
  const recordOperation = <Input, Config, Output>(
    name: string,
    run: (input: Input, config: Config) => Output
  ) => (input: Input, config: Config): Output => {
    operationTrace.push(name);
    return run(input, config);
  };
  const recordPublication = <Input, Output>(name: string, publish: (value: Input) => Output) =>
    (value: Input): Output => {
      publications.push(name);
      return publish(value);
    };
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
  const precipitationOutputs: ReturnType<typeof hydrologyDomain.climate.ops.computeMoistureForcing.run>[] = [];
  const demandInputs: PotentialDemandInput[] = [];
  const demandOutputs: number[][] = [];
  const landMask = new Uint8Array(size).fill(1);
  landMask[0] = 0;
  const elevation = new Int16Array(size).fill(100);
  elevation[0] = 0;
  const externalWaterMask = new Uint8Array(size);
  externalWaterMask[0] = 1;
  const topographyBefore = { elevation: elevation.slice(), landMask: landMask.slice(), externalWaterMask: externalWaterMask.slice() };
  const regionalDriverSnapshots: unknown[] = [];
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
    const dependencies = buildStepTestDependencies(ClimateBaselineStep, stepContext);
    observation = ClimateBaselineStep.run(
      stepContext,
      config,
      {
        computeSeasonalSampling: recordOperation("sampling", aggregateOps.computeSeasonalSampling),
        computeAtmosphericAggregate: recordOperation("atmosphere-reduction", aggregateOps.computeAtmosphericAggregate),
        computeMoistureAggregate: recordOperation("moisture-reduction", aggregateOps.computeMoistureAggregate),
        computeRadiativeForcing: recordOperation("solar", hydrologyDomain.climate.ops.computeRadiativeForcing.run),
        computeThermalState: recordOperation("thermal", (
          input: ThermalStateInput,
          thermalConfig: Parameters<typeof hydrologyDomain.climate.ops.computeThermalState.run>[1]
        ) => {
          events.push("thermal");
          thermalInputs.push(input);
          if (input.regionalResponse) regionalDriverSnapshots.push(structuredClone(input.regionalResponse));
          const output = hydrologyDomain.climate.ops.computeThermalState.run(input, thermalConfig);
          thermalOutputs.push(output);
          return output;
        }),
        computeOceanGeometry: recordOperation("geometry", (input: OceanGeometryInput) => {
          geometryInputs.push(input);
          return {
            basinId: new Int32Array(size),
            coastDistance: new Uint16Array(size),
            coastNormalU: new Int8Array(size),
            coastNormalV: new Int8Array(size),
            coastTangentU: new Int8Array(size),
            coastTangentV: new Int8Array(size),
          };
        }),
        computeOceanThermalState: recordOperation("ocean", (input: OceanThermalInput) => {
          events.push("ocean");
          oceanInputs.push(input);
          return {
            sstC: new Float32Array(size).fill(10 + oceanInputs.length),
            seaIceMask: new Uint8Array(size),
          };
        }),
        computePressureField: recordOperation("pressure", (input: PressureFieldInput) => {
          const vintage = Math.floor(pressureInputs.length / (config.computeSeasonalSampling.config.phaseCount * 2));
          pressureInputs.push(input);
          const pressure = Float32Array.from(
              input.surfaceTemperatureC,
              (value, index) => value - input.meanSurfaceTemperatureC[index]! + vintage * 2 + (input.transientPolarity ?? 0) * 0.25
            );
          pressureOutputs.push(pressure);
          return { pressure };
        }),
        computeAtmosphericCirculation: recordOperation("wind", (input: AtmosphericCirculationInput) => {
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
        }),
        computeOceanSurfaceCurrents: recordOperation("current", (input: OceanCurrentsInput) => {
          currentInputs.push(input);
          const output = {
            currentU: Int8Array.from(input.windU, (value) => value * 2),
            currentV: Int8Array.from(input.windV),
          };
          currentOutputs.push(output);
          return output;
        }),
        computeMoistureForcing: recordOperation("moisture", (input: PrecipitationInput) => {
          precipitationInputs.push(input);
          const output = {
            precipitation: Float32Array.from(input.windU, (value, index) =>
              options.spatialMoisture ? [0, 0, 12, 100][index % width]! : Math.abs(value) + 0.25
            ),
            surfaceWetness: Float32Array.from(input.windV, (value, index) =>
              options.spatialMoisture ? [0, 0.1, 0.5, 0.9][index % width]! : Math.abs(value) / 127
            ),
          };
          precipitationOutputs.push(output);
          return output;
        }),
        computePotentialDemand: recordOperation("demand", (
          input: PotentialDemandInput,
          demandConfig: Parameters<typeof hydrologyDomain.climate.ops.computePotentialDemand.run>[1]
        ) => {
          demandInputs.push(input);
          const output = hydrologyDomain.climate.ops.computePotentialDemand.run(input, demandConfig);
          demandOutputs.push(output.pet);
          return output;
        }),
      },
      {
        ...dependencies,
        artifacts: {
          ...dependencies.artifacts,
          baselineClimateField: { ...dependencies.artifacts.baselineClimateField, publish: recordPublication("baselineClimateField", dependencies.artifacts.baselineClimateField.publish) },
          pressureField: { ...dependencies.artifacts.pressureField, publish: recordPublication("pressureField", dependencies.artifacts.pressureField.publish) },
          windField: { ...dependencies.artifacts.windField, publish: recordPublication("windField", dependencies.artifacts.windField.publish) },
          thermalField: { ...dependencies.artifacts.thermalField, publish: recordPublication("thermalField", dependencies.artifacts.thermalField.publish) },
        },
      }
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
    operationTrace,
    publications,
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
    externalWaterMask,
    demandInputs,
    demandOutputs,
    regionalDriverSnapshots,
    topographyBefore,
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
    expect(run.observation.seasonalIntegration.precipitation).toHaveLength(phaseCount);
    expect(run.observation.seasonalSurfaceTemperatureC).toHaveLength(4);
  });

  it("keeps the exact incumbent operation schedule and inputs at zero gain", () => {
    for (const couplingIterations of [1, 2, 3, 4] as const) {
      const run = capturePeriodicComposition(4, undefined, { couplingIterations });
      const phaseCount = run.observation.seasonalIntegration.phases.length;
      const atmospherePass = ["thermal", ...Array.from({ length: phaseCount }, () =>
        ["pressure", "wind", "current", "pressure", "wind", "current", "atmosphere-reduction"]
      ).flat(), "atmosphere-reduction"];
      const moisturePass = Array.from({ length: phaseCount }, () =>
        ["moisture", "moisture", "moisture-reduction", "demand"]
      ).flat();
      expect(run.operationTrace).toEqual([
        "sampling", "geometry", "solar", "ocean",
        ...Array.from({ length: couplingIterations }, () => [...atmospherePass, "ocean"]).flat(),
        ...atmospherePass, ...moisturePass, "moisture-reduction",
      ]);
      for (const input of run.thermalInputs) {
        expect(Object.hasOwn(input, "regionalResponse")).toBe(false);
      }
      expect(run.regionalDriverSnapshots).toEqual([]);
      expect(run.publications).toEqual(["baselineClimateField", "pressureField", "windField", "thermalField"]);
    }
  });

  it("freezes actual provisional P/D once at SST2 and publishes only the corrected final vintage", () => {
    const incumbent = capturePeriodicComposition(4, undefined, { spatialMoisture: true });
    const run = capturePeriodicComposition(4, undefined, { spatialMoisture: true, regionalGainC: 6 });
    const phaseCount = run.observation.seasonalIntegration.phases.length;
    const membersPerVintage = phaseCount * 2;
    expect(run.events).toEqual(["ocean", "thermal", "ocean", "thermal", "ocean", "thermal", "thermal"]);
    expect(run.oceanInputs).toEqual(incumbent.oceanInputs);
    expect(run.observation.oceanThermal).toEqual(incumbent.observation.oceanThermal);
    expect(run.thermalInputs).toHaveLength(4);
    expect(run.thermalInputs.slice(0, 3)).toEqual(incumbent.thermalInputs);
    expect(run.pressureInputs.slice(0, 2 * membersPerVintage)).toEqual(incumbent.pressureInputs.slice(0, 2 * membersPerVintage));
    expect(run.circulationInputs.slice(0, 2 * membersPerVintage)).toEqual(incumbent.circulationInputs.slice(0, 2 * membersPerVintage));
    expect(run.currentInputs.slice(0, 2 * membersPerVintage)).toEqual(incumbent.currentInputs.slice(0, 2 * membersPerVintage));
    const driver = run.thermalInputs[3]!.regionalResponse;
    if (!driver) throw new Error("Expected one frozen regional driver.");
    expect(run.regionalDriverSnapshots).toEqual([driver]);
    expect(driver.phases).toBe(run.observation.seasonalIntegration.phases);
    expect(driver.phases).toHaveLength(24);
    expect(driver.gainC).toBe(6);
    expect(driver.axialTiltDeg).toBe(run.config.seasonality.axialTiltDeg);
    expect([driver.tMinC, driver.tMaxC]).toEqual([run.config.potentialDemand.tMinC, run.config.potentialDemand.tMaxC]);
    expect(run.thermalInputs[3]!.sstC).toBe(run.thermalInputs[2]!.sstC);
    expect(run.thermalInputs[3]!.landMask).toBe(run.landMask);
    expect(run.precipitationInputs).toHaveLength(membersPerVintage * 2);
    expect(run.demandInputs).toHaveLength(phaseCount * 2);
    const corrected = run.thermalOutputs[3]!;
    const finalMemberStart = 3 * membersPerVintage;
    const finalAtmosphere = [];
    const finalMoisture = [];
    for (let phase = 0; phase < phaseCount; phase++) {
      const provisionalMoisture = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
        width: 4, height: 3, reduction: "weather-members",
        samples: run.precipitationOutputs.slice(phase * 2, phase * 2 + 2),
      }, run.config.computeMoistureAggregate);
      expect(driver.precipitationByPhase[phase]).toEqual(provisionalMoisture.precipitation);
      expect(driver.demandByPhase[phase]).toBe(run.demandOutputs[phase]);
      expect(run.demandInputs[phase]!.surfaceWetness).toEqual(provisionalMoisture.surfaceWetness);
      expect(run.demandInputs[phase]!.surfaceTemperatureC).toBe(run.thermalOutputs[2]!.samples[phase]!.surfaceTemperatureC);
      expect(run.demandInputs[phase + phaseCount]!.surfaceTemperatureC).toBe(corrected.samples[phase]!.surfaceTemperatureC);
      expect(run.demandOutputs[phase + phaseCount]).toBe(run.observation.seasonalIntegration.potentialDemand[phase]);
      const memberStart = finalMemberStart + phase * 2;
      for (const member of [0, 1]) {
        expect(run.pressureInputs[memberStart + member]!.surfaceTemperatureC).toBe(corrected.samples[phase]!.seaLevelTemperatureC);
        expect(run.pressureInputs[memberStart + member]!.meanSurfaceTemperatureC).toBe(corrected.meanSeaLevelTemperatureC);
        const moistureInput = run.precipitationInputs[membersPerVintage + phase * 2 + member]!;
        expect(moistureInput.windU).toBe(run.windOutputs[memberStart + member]!.windU);
        expect(moistureInput.windV).toBe(run.windOutputs[memberStart + member]!.windV);
        expect(moistureInput.sstC).toBe(run.thermalInputs[2]!.sstC);
        expect(moistureInput.seaIceMask).toBe(run.observation.oceanThermal.seaIceMask);
      }
      finalAtmosphere.push(hydrologyDomain.climate.ops.computeAtmosphericAggregate.run({
        width: 4, height: 3, reduction: "weather-members",
        samples: [0, 1].map((member) => ({
          pressure: run.pressureOutputs[memberStart + member]!,
          ...run.windOutputs[memberStart + member]!,
          ...run.currentOutputs[memberStart + member]!,
        })),
      }, run.config.computeAtmosphericAggregate));
      const moisture = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
        width: 4, height: 3, reduction: "weather-members",
        samples: run.precipitationOutputs.slice(membersPerVintage + phase * 2, membersPerVintage + phase * 2 + 2),
      }, run.config.computeMoistureAggregate);
      expect(run.demandInputs[phase + phaseCount]!.surfaceWetness).toEqual(moisture.surfaceWetness);
      finalMoisture.push({
        precipitation: moisture.precipitation,
        surfaceWetness: moisture.surfaceWetness,
        potentialDemand: run.demandOutputs[phase + phaseCount]!,
      });
    }
    expect(driver.demandByPhase.flat().some((value) => value !== Math.fround(value))).toBe(true);
    expect(driver.demandByPhase.flat().every((value) => value >= 9.5)).toBe(true);
    expect(run.thermalOutputs[3]!.annualSurfaceTemperatureC).not.toEqual(run.thermalOutputs[2]!.annualSurfaceTemperatureC);
    expect(run.observation.seasonalIntegration.potentialDemand).not.toEqual(driver.demandByPhase);
    const annualAtmosphere = hydrologyDomain.climate.ops.computeAtmosphericAggregate.run({
      width: 4, height: 3, reduction: "annual", model: "periodic-cycle",
      weights: run.observation.seasonalIntegration.weights,
      samples: finalAtmosphere.map(({ reduction, ...sample }) => sample),
    }, run.config.computeAtmosphericAggregate);
    expect(run.observation.pressureField.pressure).toEqual(annualAtmosphere.pressure);
    expect(run.observation.windField).toEqual({ windU: annualAtmosphere.windU, windV: annualAtmosphere.windV });
    expect(run.observation.currentField).toEqual({ currentU: annualAtmosphere.currentU, currentV: annualAtmosphere.currentV });
    const annualMoisture = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
      width: 4, height: 3, reduction: "annual", model: "periodic-cycle",
      weights: run.observation.seasonalIntegration.weights, samples: finalMoisture,
    }, run.config.computeMoistureAggregate);
    if (annualMoisture.reduction !== "annual") throw new Error("Expected corrected annual moisture.");
    expect(run.observation.baselineClimateField.precipitation).toEqual(annualMoisture.precipitation);
    expect(run.observation.baselineClimateField.surfaceWetness).toEqual(annualMoisture.surfaceWetness);
    expect(run.observation.baselineClimateField.potentialDemand).toEqual(annualMoisture.potentialDemand);
    expect(run.observation.baselineClimateField.demandParameters).toEqual(run.config.potentialDemand);
    expect(run.observation.thermalField.surfaceTemperatureC).toBe(corrected.annualSurfaceTemperatureC);
    expect(run.observation.thermalResponse).toEqual({
      annualUnclippedSurfaceTemperatureC: corrected.annualUnclippedSurfaceTemperatureC,
      annualClippingDeltaC: corrected.annualClippingDeltaC,
    });
    expect(run.publications).toEqual(["baselineClimateField", "pressureField", "windField", "thermalField"]);
    expect(readArtifact(run.context, climateArtifacts.thermalField)).toEqual(run.observation.thermalField);
    expect({ elevation: run.elevation, landMask: run.landMask, externalWaterMask: run.externalWaterMask }).toEqual(run.topographyBefore);
  });

  it("refuses a positive candidate gain outside its two-update schedule", () => {
    for (const couplingIterations of [1, 3, 4] as const) {
      expect(() => capturePeriodicComposition(4, undefined, { regionalGainC: 6, couplingIterations }))
        .toThrow("exactly two ocean coupling updates");
    }
  });

  it("leaves zero-demand configurations on the incumbent route but refuses enabled source D=0", () => {
    expect(capturePeriodicComposition(4, undefined, { zeroDemand: true }).demandOutputs.flat().every((value) => value === 0)).toBe(true);
    expect(() => capturePeriodicComposition(4, undefined, { zeroDemand: true, regionalGainC: 6 }))
      .toThrow("strictly positive original-land source demand");
  });

  it("refuses retired selectors and controls at the current step boundary", () => {
    const config = climateBaselineConfig();
    for (const key of ["computeEvaporationSources", "transportMoisture", "computePrecipitation"]) {
      expect(Object.hasOwn(hydrologyDomain.climate.ops, key)).toBe(false);
    }
    for (const [key, retired] of [
      ["computeSeasonalSampling", { strategy: "legacy-snapshots", config: {} }],
      ["computeRadiativeForcing", { strategy: "latitude-insolation", config: {} }],
      ["computeThermalState", { strategy: "insolation-lapse-rate", config: {} }],
      ["computeAtmosphericCirculation", {
        strategy: "latitude",
        config: { windJetStreaks: 0, windJetStrength: 0, windVariance: 0 },
      }],
      ["computeOceanSurfaceCurrents", { strategy: "latitude", config: { strength: 0 } }],
      ["computeEvaporationSources", { strategy: "thermal-surface", config: {} }],
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

  it("refuses retained owners' retired selectors at operation admission", () => {
    for (const [schema, retired] of [
      [hydrologyDomain.climate.ops.computeAtmosphericCirculation.config, {
        strategy: "latitude",
        config: { windJetStreaks: 0, windJetStrength: 0, windVariance: 0 },
      }],
      [hydrologyDomain.ocean.ops.computeOceanSurfaceCurrents.config, {
        strategy: "latitude", config: { strength: 0 },
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
        const forcing = run.precipitationInputs[phase * 2 + member]!;
        expect(forcing.windU).toBe(run.windOutputs[start + phase * 2 + member]!.windU);
        expect(forcing.windV).toBe(run.windOutputs[start + phase * 2 + member]!.windV);
        expect(forcing.sstC).toBe(run.thermalInputs.at(-1)!.sstC);
        expect(forcing.seaIceMask).toBe(run.observation.oceanThermal.seaIceMask);
        expect(forcing.landMask).toBe(run.landMask);
        expect(forcing.externalWaterMask).toBe(run.externalWaterMask);
        expect(forcing.elevation).toBe(run.elevation);
        expect(forcing.seaLevel).toBe(0);
        expect(Object.keys(forcing).sort()).toEqual([
          "elevation", "externalWaterMask", "height", "landMask", "seaIceMask",
          "seaLevel", "sstC", "width", "windU", "windV",
        ]);
      }
      const moisture = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
        width: 4, height: 3, reduction: "weather-members",
        samples: run.precipitationOutputs.slice(phase * 2, phase * 2 + 2),
      }, run.config.computeMoistureAggregate);
      expect(run.demandInputs[phase]!.surfaceWetness).toEqual(moisture.surfaceWetness);
      expect(run.demandInputs[phase]!.surfaceWetness).toBe(run.observation.seasonalIntegration.surfaceWetness[phase]);
      expect(Object.hasOwn(run.demandInputs[phase]!, "landMask")).toBe(false);
      expect(run.demandInputs[phase]!.parameters).toEqual(run.config.potentialDemand);
      expect(run.demandOutputs[phase]![0]).toBeGreaterThan(0);
      return { precipitation: moisture.precipitation, surfaceWetness: moisture.surfaceWetness, potentialDemand: run.demandOutputs[phase]! };
    });
    const annual = hydrologyDomain.climate.ops.computeMoistureAggregate.run({
      width: 4, height: 3, reduction: "annual", model: "periodic-cycle", weights, samples: finalSamples,
    }, run.config.computeMoistureAggregate);
    if (annual.reduction !== "annual") {
      throw new Error("Expected annual moisture reduction.");
    }
    expect(run.observation.baselineClimateField.precipitation).toEqual(annual.precipitation);
    expect(run.observation.baselineClimateField.rainfallCodec).toEqual(annual.rainfallCodec);
    expect(run.observation.baselineClimateField.surfaceWetness).toEqual(annual.surfaceWetness);
    expect(run.observation.baselineClimateField.potentialDemand).toEqual(annual.potentialDemand);
    expect(annual.potentialDemand[0]).toBeGreaterThan(0);
    expect(run.observation.baselineClimateField.demandParameters).toEqual(run.config.potentialDemand);
    expect(readArtifact(run.context, climateArtifacts.thermalField)).toEqual(run.observation.thermalField);
    for (let index = 0; index < observationIndices.length; index++) {
      const phase = observationIndices[index]!;
      expect(run.observation.seasonalPrecipitation[index]).toBe(run.observation.seasonalIntegration.precipitation[phase]);
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
        run.observation.seasonalPrecipitation, run.observation.seasonalSurfaceWetness,
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
