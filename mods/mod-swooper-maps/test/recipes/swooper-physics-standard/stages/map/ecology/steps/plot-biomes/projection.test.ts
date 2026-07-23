import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { BiomesStep as biomesStep } from "../../../../../../../../src/recipes/standard/stages/ecology/biomes/steps/biomes/step.js";
import { artifacts as mapEcologyArtifacts } from "../../../../../../../../src/recipes/standard/stages/map/ecology/artifacts/index.js";
import { PlotBiomesStep as plotBiomesStep } from "../../../../../../../../src/recipes/standard/stages/map/ecology/steps/plot-biomes/step.js";
import { TEST_MAP_SIZE } from "../../../../../../../map-size.js";

describe("plot biomes step", () => {
  it("projects marine and land biome bindings into Civ7", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    });

    const adapter = createMockAdapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo });
    adapter.fillWater(false);
    adapter.setWater(0, 0, true);

    const context = createMapContext({ setup, adapter });
    const landMask = new Uint8Array(size).fill(1);
    landMask[0] = 0;
    const elevation = new Int16Array(size).fill(1);
    elevation[0] = 0;

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation,
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, hydrologyArtifacts.cryosphere, {
        snowCover: new Uint8Array(size),
        seaIceCover: new Uint8Array(size),
        albedo: new Uint8Array(size),
        groundIce01: new Float32Array(size),
        permafrost01: new Float32Array(size),
        meltPotential01: new Float32Array(size),
      });
      publishTestArtifact(stepContext, hydrologyArtifacts.climateIndices, {
        surfaceTemperatureC: new Float32Array(size).fill(15),
        effectiveMoisture: new Float32Array(size).fill(160),
        pet: new Float32Array(size),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
      });
      publishTestArtifact(stepContext, ecologyArtifacts.pedology, {
        width,
        height,
        soilType: new Uint8Array(size).fill(0),
        fertility: new Float32Array(size).fill(0.5),
      });

      const classifyConfig = normalizeOperationSelectionForTest(
        ecology.ops.classifyBiomes,
        ecology.ops.classifyBiomes.defaultConfig
      );
      const ecologyOps = ecology.ops.bind(biomesStep.contract.ops!).runtime;
      biomesStep.run(
        stepContext,
        { classify: classifyConfig },
        ecologyOps,
        buildStepTestDependencies(biomesStep)
      );
      plotBiomesStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(plotBiomesStep, stepContext)
      );
    });

    const bindings = readValidatedArtifact(context, mapEcologyArtifacts.biomeBindings);
    const marineId = adapter.getBiomeGlobal("BIOME_MARINE");
    expect(bindings.engineBiomeId[0]).toBe(marineId);
    expect(adapter.getBiomeType(0, 0)).toBe(marineId);

    const landIndex = 1;
    expect(bindings.engineBiomeId[landIndex]).not.toBe(marineId);
    expect(bindings.engineBiomeId[landIndex]).toBeGreaterThanOrEqual(0);
    expect(adapter.getBiomeType(landIndex, 0)).toBe(bindings.engineBiomeId[landIndex]);
  });
});
