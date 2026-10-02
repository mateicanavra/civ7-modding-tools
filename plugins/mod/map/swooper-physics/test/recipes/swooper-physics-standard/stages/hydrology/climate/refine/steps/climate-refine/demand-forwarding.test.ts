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
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import standardRecipe from "../../../../../../../../../src/recipes/standard/recipe.js";
import { ClimateRefineStep } from "../../../../../../../../../src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../../setup.js";
import { createEmptyWaterFixture } from "../../../../../morphology/features/fixtures/surface-water.js";
import {
  createStandardRecipeTestConfig,
  createStandardRecipeTestInitialSetup,
  standardMapConfig,
} from "../../../../../../fixtures/standard-recipe.js";

describe("hydrology climate-refine demand ownership", () => {
  for (const cryosphere of ["off", "on"] as const) {
    it(`preserves baseline thermal ownership with cryosphere ${cryosphere} and forwards demand calibration`, () => {
      const { width, height } = TEST_MAP_SIZE.dimensions;
      const size = width * height;
      const setup = admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: { width, height },
        latitudeBounds: standardMapConfig.latitudeBounds,
      });
      const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
      const authored = createStandardRecipeTestConfig();
      authored["hydrology-climate-refine"].knobs.cryosphere = cryosphere;
      const config = standardRecipe.compileConfig(createStandardRecipeTestInitialSetup(), authored)[
        "hydrology-climate-refine"
      ]["climate-refine"];
      const landMask = new Uint8Array(size).fill(1);
      landMask[0] = 0;
      const externalWaterMask = new Uint8Array(size);
      externalWaterMask[0] = 1;
      const baselineTemperature = new Float32Array(size).fill(20);
      baselineTemperature[0] = -10;
      baselineTemperature[1] = -15;
      baselineTemperature[2] = 0;
      const beforeTemperature = baselineTemperature.slice();
      let refinedTemperature: Float32Array = new Float32Array(size);
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
        publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, {
          elevation: new Int16Array(size),
          seaLevel: 0,
          landMask,
          externalWaterMask,
          bathymetry: new Int16Array(size),
        });
        publishTestArtifact(stepContext, climateArtifacts.baselineClimateField, {
          rainfall: new Uint8Array(size).fill(5),
          humidity: new Uint8Array(size).fill(6),
          potentialDemand: new Float32Array(size).fill(999),
          demandParameters: parameters,
        });
        publishTestArtifact(stepContext, climateArtifacts.thermalField, {
          surfaceTemperatureC: baselineTemperature,
        });
        publishTestArtifact(stepContext, climateArtifacts.windField, {
          windU: new Int8Array(size),
          windV: new Int8Array(size),
        });
        const waterFixture = createEmptyWaterFixture(width, height);
        waterFixture.hydrography.exposedLandMask[0] = 0;
        publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, waterFixture.hydrography);
        publishTestArtifact(
          stepContext,
          hydrographyArtifacts.lakePlan,
          waterFixture.lakePlan
        );
        const result = ClimateRefineStep.run(
          stepContext,
          config,
          {
            refinePrecipitation: () => ({ rainfall, humidity: refinedHumidity }),
            applyAlbedoFeedback: (
              ...[input, albedoConfig]: Parameters<
                typeof hydrology.cryosphere.ops.applyAlbedoFeedback.run
              >
            ) => {
              expect(input.surfaceTemperatureC).toBe(baselineTemperature);
              expect(input.landMask).toBe(landMask);
              expect(input.rainfall).toBe(rainfall);
              const output = hydrology.cryosphere.ops.applyAlbedoFeedback.run(input, albedoConfig);
              refinedTemperature = output.surfaceTemperatureC;
              return output;
            },
            computeCryosphereState: hydrology.cryosphere.ops.computeCryosphereState.run,
            computePotentialDemand: (
              input: Parameters<typeof hydrology.climate.ops.computePotentialDemand.run>[0],
              demandConfig: typeof hydrology.climate.ops.computePotentialDemand.defaultConfig
            ) => {
              demandCalls++;
              expect(Object.hasOwn(input, "landMask")).toBe(false);
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
      const surfaceTemperature = indices.surfaceTemperatureC;
      const expected = hydrology.climate.ops.computePotentialDemand.run(
        {
          width,
          height,
          surfaceTemperatureC: refinedTemperature,
          humidity: refinedHumidity,
          parameters,
        },
        hydrology.climate.ops.computePotentialDemand.defaultConfig
      );
      expect(computedPet).toEqual(expected.pet);
      expect(computedPet[0]).toBeGreaterThan(0);
      const expectedTerrestrialPet = Float32Array.from(expected.pet);
      expectedTerrestrialPet[0] = 0;
      expect(indices.pet).toEqual(expectedTerrestrialPet);
      expect(indices.pet[0]).toBe(0);
      expect(indices.effectiveMoisture[1]).toBe(75);
      expect(indices.aridityIndex[1]).toBe(Math.fround(expected.pet[1]! / (expected.pet[1]! + 41)));
      expect(surfaceTemperature).toBe(refinedTemperature);
      expect(baselineTemperature).toEqual(beforeTemperature);
      expect(surfaceTemperature).toEqual(
        hydrology.cryosphere.ops.applyAlbedoFeedback.run(
          {
            width,
            height,
            landMask,
            rainfall,
            surfaceTemperatureC: beforeTemperature,
          },
          config.applyAlbedoFeedback
        ).surfaceTemperatureC
      );
      if (cryosphere === "off") {
        expect(surfaceTemperature).toEqual(baselineTemperature);
      } else {
        expect(surfaceTemperature[1]).toBeLessThan(baselineTemperature[1]!);
        expect(surfaceTemperature[2]).toBe(baselineTemperature[2]);
        expect(surfaceTemperature[3]).toBe(baselineTemperature[3]);
      }
    });
  }
});
