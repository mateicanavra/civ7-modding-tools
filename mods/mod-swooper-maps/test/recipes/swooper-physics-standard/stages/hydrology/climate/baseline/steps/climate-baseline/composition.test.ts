import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import hydrologyDomain from "@mapgen/domain/hydrology/router";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  validateSchemaValueForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import hydrologyClimateBaselineStage from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/index.js";
import { ClimateBaselineStepContract } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.js";
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

function climateBaselineConfig() {
  if (!ClimateBaselineStep.normalize) {
    throw new Error("Climate baseline must normalize its authored configuration.");
  }
  const stageConfig = createStandardRecipeTestConfig()["hydrology-climate-baseline"];
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
    ClimateBaselineStepContract.schema,
    rawSteps["climate-baseline"],
    "/hydrology-climate-baseline/climate-baseline"
  );
  return validateSchemaValueForTest(
    ClimateBaselineStepContract.schema,
    ClimateBaselineStep.normalize(config, { setup, knobs }),
    "/hydrology-climate-baseline/climate-baseline"
  );
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
    const dependencies = buildStepTestDependencies(ClimateBaselineStep);
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
    const currentInputs: Array<{ windU: Int8Array; windV: Int8Array }> = [];
    let currentCall = 0;
    let thermalCurrentU: Int8Array | undefined;
    let thermalCurrentV: Int8Array | undefined;
    let currentField: Readonly<{ currentU: Int8Array; currentV: Int8Array }> | undefined;
    const thermalSstInputs: Array<Float32Array | undefined> = [];

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyArtifacts.shelf, {
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

    const windField = readValidatedArtifact(context, climateArtifacts.windField);
    expect(Array.from(windField.windU)).toEqual(Array.from(windU));
    expect(Array.from(windField.windV)).toEqual(Array.from(windV));
    expect(Array.from(currentField?.currentU ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(expectedCurrentU))
    );
    expect(Array.from(currentField?.currentV ?? [])).toEqual(
      Array.from(new Int8Array(size).fill(expectedCurrentV))
    );
  });
});
