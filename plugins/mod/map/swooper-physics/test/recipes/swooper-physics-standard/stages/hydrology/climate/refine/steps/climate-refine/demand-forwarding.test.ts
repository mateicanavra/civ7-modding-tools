import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as climateArtifacts } from "../../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import hydrology from "../../../../../../../../../src/domain/hydrology/router.js";
import { artifacts as morphologyArtifacts } from "../../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import standardRecipe from "../../../../../../../../../src/recipes/standard/recipe.js";
import { ClimateRefineStep } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  createStandardRecipeTestInitialSetup,
  standardMapConfig,
} from "../../../../../../fixtures/standard-recipe.js";

describe("hydrology climate-refine demand ownership", () => {
  it("forwards baseline calibration and evaluates only the refined temperature/humidity vintage", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      latitudeBounds: standardMapConfig.latitudeBounds,
    });
    const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
    const config = standardRecipe.compileConfig(
      createStandardRecipeTestInitialSetup(),
      createStandardRecipeTestConfig()
    )["hydrology-climate-refine"]["climate-refine"];
    const landMask = new Uint8Array(size).fill(1);
    landMask[0] = 0;
    const refinedTemperature = new Float32Array(size).fill(17.25);
    const refinedHumidity = new Uint8Array(size).fill(100);
    const rainfall = new Uint8Array(size).fill(40);
    const parameters = {
      tMinC: -10,
      tMaxC: 21,
      petBase: 43,
      petTemperatureWeight: 123,
      humidityDampening: 0.3,
    };
    let demandCalls = 0;
    let computedPet: readonly number[] = [];

    withMapContextExecutionForTest(context, (stepContext) => {
      const dependencies = buildStepTestDependencies(ClimateRefineStep, stepContext);
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, climateArtifacts.baselineClimateField, {
        rainfall: new Uint8Array(size).fill(5),
        humidity: new Uint8Array(size).fill(6),
        potentialDemand: new Float32Array(size).fill(999),
        demandParameters: parameters,
      });
      publishTestArtifact(stepContext, climateArtifacts.windField, {
        windU: new Int8Array(size),
        windV: new Int8Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        runoff: new Float32Array(size),
        discharge: new Float32Array(size),
        riverClass: new Uint8Array(size),
        flowDir: new Int32Array(size).fill(-1),
        sinkMask: new Uint8Array(size),
        outletMask: new Uint8Array(size),
        basinId: new Int32Array(size).fill(-1),
        routingElevation: new Float32Array(size),
        depressionDepth: new Float32Array(size),
        terminalType: new Uint8Array(size),
      });
      const result = ClimateRefineStep.run(
        stepContext,
        config,
        {
          refinePrecipitation: () => ({ rainfall, humidity: refinedHumidity }),
          computeRadiativeForcing: hydrology.climate.ops.computeRadiativeForcing.run,
          computeThermalState: () => ({ surfaceTemperatureC: new Float32Array(size).fill(20) }),
          applyAlbedoFeedback: () => ({ surfaceTemperatureC: refinedTemperature }),
          computeCryosphereState: hydrology.cryosphere.ops.computeCryosphereState.run,
          computePotentialDemand: (
            input: Parameters<typeof hydrology.climate.ops.computePotentialDemand.run>[0],
            demandConfig: typeof hydrology.climate.ops.computePotentialDemand.defaultConfig
          ) => {
            demandCalls++;
            expect(input.landMask).toBe(landMask);
            expect(input.surfaceTemperatureC).toBe(refinedTemperature);
            expect(input.humidity).toBe(refinedHumidity);
            expect(input.parameters).toEqual(parameters);
            const output = hydrology.climate.ops.computePotentialDemand.run(input, demandConfig);
            computedPet = output.pet;
            return output;
          },
          computeLandWaterBudget: (
            input: Parameters<typeof hydrology.climate.ops.computeLandWaterBudget.run>[0],
            budgetConfig: typeof hydrology.climate.ops.computeLandWaterBudget.defaultConfig
          ) => {
            expect(input.pet).toBe(computedPet);
            return hydrology.climate.ops.computeLandWaterBudget.run(input, budgetConfig);
          },
          computeClimateDiagnostics: hydrology.climate.ops.computeClimateDiagnostics.run,
        },
        dependencies
      );
      if (result instanceof Promise) throw new Error("Refinement must be synchronous.");
    });

    expect(demandCalls).toBe(1);
    const indices = readArtifact(context, climateArtifacts.climateIndices);
    const expected = hydrology.climate.ops.computePotentialDemand.run(
      {
        width,
        height,
        landMask,
        surfaceTemperatureC: refinedTemperature,
        humidity: refinedHumidity,
        parameters,
      },
      hydrology.climate.ops.computePotentialDemand.defaultConfig
    );
    expect(indices.pet).toEqual(Float32Array.from(expected.pet));
    expect(indices.pet[0]).toBe(0);
    expect(indices.effectiveMoisture[1]).toBe(75);
    expect(indices.aridityIndex[1]).toBe(Math.fround(expected.pet[1]! / (expected.pet[1]! + 41)));
    expect(indices.surfaceTemperatureC).toBe(refinedTemperature);
  });
});
