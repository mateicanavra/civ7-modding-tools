import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { resolveEngineBiomeIds } from "../../../../../../../../src/recipes/standard/stages/ecology/projection/model/policy/biome-projection.js";
import { PlotBiomesStep as plotBiomesStep } from "../../../../../../../../src/recipes/standard/stages/ecology/projection/steps/plot-biomes/step.js";
import {
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../../../../../setup.js";

describe("plot biomes step", () => {
  it("refuses projection when an official Civ7 biome global is unavailable", () => {
    expect(() => resolveEngineBiomeIds({ getBiomeGlobal: () => -1 })).toThrow(
      "missing biome global"
    );
  });

  it("projects marine and land biome bindings into Civ7", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });

    const adapter = createMockAdapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo });
    adapter.fillWater(false);
    adapter.setWater(0, 0, true);

    const context = createMapContext({ setup, adapter });
    const landMask = new Uint8Array(size).fill(1);
    landMask[0] = 0;
    const elevation = new Int16Array(size).fill(1);
    elevation[0] = 0;

    const result = withMapContextExecutionForTest(context, (stepContext) => {
      const biomeIndex = new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid);
      biomeIndex[0] = 255;
      publishTestArtifact(stepContext, biomeArtifacts.biomeClassification, {
        width,
        height,
        biomeIndex,
        vegetationDensity: new Float32Array(size).fill(0.5),
        treeLine01: new Float32Array(size).fill(0.75),
      });
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation,
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, climateArtifacts.climateIndices, {
        surfaceTemperatureC: new Float32Array(size).fill(15),
        effectiveMoisture: new Float32Array(size).fill(160),
        pet: new Float32Array(size),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
      });
      const stepResult = plotBiomesStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(plotBiomesStep, stepContext)
      );
      if (stepResult instanceof Promise) {
        throw new Error("The plot-biomes step must remain synchronous.");
      }
      return stepResult;
    });

    const marineId = adapter.getBiomeGlobal("BIOME_MARINE");
    expect(result.projectedBiomeId[0]).toBe(marineId);
    expect(adapter.getBiomeType(0, 0)).toBe(marineId);

    const landIndex = 1;
    const temperateHumidId = resolveEngineBiomeIds(adapter).land.temperateHumid;
    expect(result.projectedBiomeId[landIndex]).toBe(temperateHumidId);
    expect(result.bindingClass[0]).toBe(0);
    expect(result.bindingClass[landIndex]).toBeGreaterThan(0);
    expect(result.projectionMeasurementInput.landWaterMismatchCount).toBe(0);
    expect(adapter.getBiomeType(landIndex, 0)).toBe(temperateHumidId);
  });
});
