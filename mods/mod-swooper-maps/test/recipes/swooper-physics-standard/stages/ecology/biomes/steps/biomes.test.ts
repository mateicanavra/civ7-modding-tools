import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import ecology from "@mapgen/domain/ecology/router";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "@mapgen/domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { BiomesStep as biomesStep } from "../../../../../../../src/recipes/standard/stages/ecology/biomes/steps/biomes/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";

describe("biomes step", () => {
  it("publishes classifier-owned biome and vegetation truth from Hydrology climate indices", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    });

    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
    });
    adapter.fillWater(false);
    const ctx = createMapContext({ setup, adapter });

    const landMask = new Uint8Array(size).fill(1);
    const elevation = new Int16Array(size).fill(1);
    const effectiveMoistureIn = Float32Array.from(
      { length: size },
      (_value, index) => 100 + (index % 3) * 100
    );
    const surfaceTemperatureC = Float32Array.from(
      { length: size },
      (_value, index) => 10 + (index % 3) * 10
    );
    const aridityIndex = Float32Array.from(
      { length: size },
      (_value, index) => 0.1 + (index % 3) * 0.1
    );
    const freezeIndex = Float32Array.from(
      { length: size },
      (_value, index) => 0.9 - (index % 3) * 0.1
    );

    withMapContextExecutionForTest(ctx, (stepContext) => {
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation,
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, cryosphereArtifacts.cryosphere, {
        snowCover: new Uint8Array(size),
        seaIceCover: new Uint8Array(size),
        albedo: new Uint8Array(size),
        groundIce01: new Float32Array(size),
        permafrost01: new Float32Array(size),
        meltPotential01: new Float32Array(size),
      });

      publishTestArtifact(stepContext, climateArtifacts.climateIndices, {
        surfaceTemperatureC,
        effectiveMoisture: effectiveMoistureIn,
        pet: new Float32Array(size),
        aridityIndex,
        freezeIndex,
      });
      publishTestArtifact(stepContext, pedologyArtifacts.pedology, {
        width,
        height,
        soilType: new Uint8Array(size).fill(0),
        fertility: new Float32Array(size).fill(0.5),
      });

      const classifyConfig = normalizeOperationSelectionForTest(
        ecology.biomes.ops.classifyBiomes,
        ecology.biomes.ops.classifyBiomes.defaultConfig
      );

      const ops = ecology.biomes.ops.bind(biomesStep.contract.ops!).runtime;
      biomesStep.run(
        stepContext,
        { classify: classifyConfig },
        ops,
        buildStepTestDependencies(biomesStep)
      );
    });

    const classification = readValidatedArtifact(ctx, biomeArtifacts.biomeClassification);
    expect(Array.from(classification.biomeIndex)).not.toContain(255);
    expect(new Set(classification.biomeIndex).size).toBeGreaterThan(1);
    expect(new Set(classification.vegetationDensity).size).toBeGreaterThan(1);
  });

  it("forwards hydrology effectiveMoisture (no local riparian logic)", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    });

    const classifyConfig = normalizeOperationSelectionForTest(
      ecology.biomes.ops.classifyBiomes,
      ecology.biomes.ops.classifyBiomes.defaultConfig
    );

    const run = (effectiveMoistureIn: Float32Array): Float32Array => {
      const adapter = createMockAdapter({
        ...TEST_MAP_SIZE.dimensions,
        mapInfo: TEST_MAP_SIZE.mapInfo,
        mapSizeId: TEST_MAP_SIZE.id,
      });
      adapter.fillWater(false);

      const ctx = createMapContext({ setup, adapter });

      const landMask = new Uint8Array(size).fill(1);
      const elevation = new Int16Array(size).fill(1);

      withMapContextExecutionForTest(ctx, (stepContext) => {
        publishTestArtifact(stepContext, morphologyArtifacts.topography, {
          elevation,
          seaLevel: 0,
          landMask,
          bathymetry: new Int16Array(size),
        });
        publishTestArtifact(stepContext, cryosphereArtifacts.cryosphere, {
          snowCover: new Uint8Array(size),
          seaIceCover: new Uint8Array(size),
          albedo: new Uint8Array(size),
          groundIce01: new Float32Array(size),
          permafrost01: new Float32Array(size),
          meltPotential01: new Float32Array(size),
        });
        publishTestArtifact(stepContext, climateArtifacts.climateIndices, {
          surfaceTemperatureC: new Float32Array(size).fill(15),
          effectiveMoisture: effectiveMoistureIn,
          pet: new Float32Array(size),
          aridityIndex: new Float32Array(size).fill(0.2),
          freezeIndex: new Float32Array(size).fill(0.05),
        });
        publishTestArtifact(stepContext, pedologyArtifacts.pedology, {
          width,
          height,
          soilType: new Uint8Array(size).fill(0),
          fertility: new Float32Array(size).fill(0.5),
        });

        const ops = ecology.biomes.ops.bind(biomesStep.contract.ops!).runtime;
        biomesStep.run(
          stepContext,
          { classify: classifyConfig },
          ops,
          buildStepTestDependencies(biomesStep)
        );
      });
      return readValidatedArtifact(ctx, biomeArtifacts.biomeClassification).vegetationDensity;
    };

    const baseline = new Float32Array(size).fill(120);
    const boosted = new Float32Array(size).fill(120);
    // Simulate "upstream" (Hydrology) riparian influence baked into climateIndices.effectiveMoisture.
    const center = Math.floor(height / 2) * width + Math.floor(width / 2);
    const adjacent = center + 1;
    boosted[center] += 8;
    boosted[adjacent] += 8;

    const densityBaseline = run(baseline);
    const densityBoosted = run(boosted);

    const far = 0;

    expect(densityBoosted[center]).toBeGreaterThan(densityBaseline[center]!);
    expect(densityBoosted[adjacent]).toBeGreaterThan(densityBaseline[adjacent]!);
    expect(densityBoosted[far]).toBe(densityBaseline[far]);
  });
});
