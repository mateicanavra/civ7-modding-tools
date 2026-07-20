import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { BiomesStep as biomesStep } from "../../../../../../../src/recipes/standard/stages/ecology-biomes/steps/biomes/step.js";
import { artifactModules as hydrologyClimateRefineArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-climate-refine/artifacts/index.js";
import { PlotBiomesStep as plotBiomesStep } from "../../../../../../../src/recipes/standard/stages/map-ecology/steps/plot-biomes/step.js";
import { BiomeEngineBindingsSchema } from "../../../../../../../src/recipes/standard/stages/map-projection-public-config.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

describe("biomes step", () => {
  it("assigns marine biome to water tiles", () => {
    const syntheticDimensions = { width: 4, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    adapter.setWater(0, 0, true);

    const ctx = createMapContext({ setup, adapter });

    const landMask = new Uint8Array(size).fill(1);
    landMask[0] = 0;
    const elevation = new Int16Array(size).fill(1);
    elevation[0] = 0;

    withMapContextExecutionForTest(ctx, () => {
      publishTestArtifact(ctx, morphologyArtifactModules.topography, {
        elevation,
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(ctx, hydrologyClimateRefineArtifactModules.cryosphere, {
        snowCover: new Uint8Array(size),
        seaIceCover: new Uint8Array(size),
        albedo: new Uint8Array(size),
        groundIce01: new Float32Array(size),
        permafrost01: new Float32Array(size),
        meltPotential01: new Float32Array(size),
      });
      publishTestArtifact(ctx, hydrologyClimateRefineArtifactModules.climateIndices, {
        surfaceTemperatureC: new Float32Array(size).fill(15),
        effectiveMoisture: new Float32Array(size).fill(160),
        pet: new Float32Array(size),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
      });
      publishTestArtifact(ctx, ecologyArtifactModules.pedology, {
        width,
        height,
        soilType: new Uint8Array(size).fill(0),
        fertility: new Float32Array(size).fill(0.5),
      });

      const classifyConfig = normalizeOperationSelectionForTest(
        ecology.ops.classifyBiomes,
        ecology.ops.classifyBiomes.defaultConfig
      );

      const ops = ecology.ops.bind(biomesStep.contract.ops!).runtime;
      biomesStep.run(ctx, { classify: classifyConfig }, ops, buildStepTestDependencies(biomesStep));

      plotBiomesStep.run(
        ctx,
        { bindings: Value.Create(BiomeEngineBindingsSchema) },
        {},
        buildStepTestDependencies(plotBiomesStep)
      );
    });

    const bindings = ctx.artifacts.get(ecologyArtifacts.biomeBindings.id) as
      | { engineBiomeId: Uint16Array }
      | undefined;
    const biomeId = bindings?.engineBiomeId;
    if (!(biomeId instanceof Uint16Array)) {
      throw new Error("Missing biomeBindings evidence after plot-biomes.");
    }
    const marineId = adapter.getBiomeGlobal("BIOME_MARINE");
    expect(biomeId[0]).toBe(marineId);
    expect(adapter.getBiomeType(0, 0)).toBe(marineId);

    const landIdx = 1;
    expect(biomeId[landIdx]).not.toBe(marineId);
    expect(biomeId[landIdx]).toBeGreaterThanOrEqual(0);
    expect(adapter.getBiomeType(landIdx, 0)).toBe(biomeId[landIdx]);
  });

  it("uses hydrology climateIndices for temperature/aridity/freeze (no local re-derive)", () => {
    const syntheticDimensions = { width: 3, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    const ctx = createMapContext({ setup, adapter });

    const landMask = new Uint8Array(size).fill(1);
    const elevation = new Int16Array(size).fill(1);

    withMapContextExecutionForTest(ctx, () => {
      publishTestArtifact(ctx, morphologyArtifactModules.topography, {
        elevation,
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(ctx, hydrologyClimateRefineArtifactModules.cryosphere, {
        snowCover: new Uint8Array(size),
        seaIceCover: new Uint8Array(size),
        albedo: new Uint8Array(size),
        groundIce01: new Float32Array(size),
        permafrost01: new Float32Array(size),
        meltPotential01: new Float32Array(size),
      });

      const effectiveMoistureIn = new Float32Array([100, 200, 300]);
      const surfaceTemperatureC = new Float32Array([10, 20, 30]);
      const aridityIndex = new Float32Array([0.1, 0.2, 0.3]);
      const freezeIndex = new Float32Array([0.9, 0.8, 0.7]);
      publishTestArtifact(ctx, hydrologyClimateRefineArtifactModules.climateIndices, {
        surfaceTemperatureC,
        effectiveMoisture: effectiveMoistureIn,
        pet: new Float32Array(size),
        aridityIndex,
        freezeIndex,
      });
      publishTestArtifact(ctx, ecologyArtifactModules.pedology, {
        width,
        height,
        soilType: new Uint8Array(size).fill(0),
        fertility: new Float32Array(size).fill(0.5),
      });

      const classifyConfig = normalizeOperationSelectionForTest(
        ecology.ops.classifyBiomes,
        ecology.ops.classifyBiomes.defaultConfig
      );

      const ops = ecology.ops.bind(biomesStep.contract.ops!).runtime;
      biomesStep.run(ctx, { classify: classifyConfig }, ops, buildStepTestDependencies(biomesStep));

      const classification = ctx.artifacts.get(ecologyArtifacts.biomeClassification.id) as
        | {
            surfaceTemperature?: Float32Array;
            effectiveMoisture?: Float32Array;
            aridityIndex?: Float32Array;
            freezeIndex?: Float32Array;
          }
        | undefined;
      if (!(classification?.surfaceTemperature instanceof Float32Array))
        throw new Error("Missing surfaceTemperature.");
      if (!(classification?.effectiveMoisture instanceof Float32Array))
        throw new Error("Missing effectiveMoisture.");
      if (!(classification?.aridityIndex instanceof Float32Array))
        throw new Error("Missing aridityIndex.");
      if (!(classification?.freezeIndex instanceof Float32Array))
        throw new Error("Missing freezeIndex.");

      expect(Array.from(classification.surfaceTemperature)).toEqual(
        Array.from(surfaceTemperatureC)
      );
      expect(Array.from(classification.effectiveMoisture)).toEqual(Array.from(effectiveMoistureIn));
      expect(Array.from(classification.aridityIndex)).toEqual(Array.from(aridityIndex));
      expect(Array.from(classification.freezeIndex)).toEqual(Array.from(freezeIndex));
    });
  });

  it("forwards hydrology effectiveMoisture (no local riparian logic)", () => {
    const syntheticDimensions = { width: 5, height: 5 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const classifyConfig = normalizeOperationSelectionForTest(
      ecology.ops.classifyBiomes,
      ecology.ops.classifyBiomes.defaultConfig
    );

    const run = (effectiveMoistureIn: Float32Array): Float32Array => {
      const adapter = createMockAdapter({ width, height });
      adapter.fillWater(false);

      const ctx = createMapContext({ setup, adapter });

      const landMask = new Uint8Array(size).fill(1);
      const elevation = new Int16Array(size).fill(1);

      return withMapContextExecutionForTest(ctx, () => {
        publishTestArtifact(ctx, morphologyArtifactModules.topography, {
          elevation,
          seaLevel: 0,
          landMask,
          bathymetry: new Int16Array(size),
        });
        publishTestArtifact(ctx, hydrologyClimateRefineArtifactModules.cryosphere, {
          snowCover: new Uint8Array(size),
          seaIceCover: new Uint8Array(size),
          albedo: new Uint8Array(size),
          groundIce01: new Float32Array(size),
          permafrost01: new Float32Array(size),
          meltPotential01: new Float32Array(size),
        });
        publishTestArtifact(ctx, hydrologyClimateRefineArtifactModules.climateIndices, {
          surfaceTemperatureC: new Float32Array(size).fill(15),
          effectiveMoisture: effectiveMoistureIn,
          pet: new Float32Array(size),
          aridityIndex: new Float32Array(size).fill(0.2),
          freezeIndex: new Float32Array(size).fill(0.05),
        });
        publishTestArtifact(ctx, ecologyArtifactModules.pedology, {
          width,
          height,
          soilType: new Uint8Array(size).fill(0),
          fertility: new Float32Array(size).fill(0.5),
        });

        const ops = ecology.ops.bind(biomesStep.contract.ops!).runtime;
        biomesStep.run(
          ctx,
          { classify: classifyConfig },
          ops,
          buildStepTestDependencies(biomesStep)
        );

        const classification = ctx.artifacts.get(ecologyArtifacts.biomeClassification.id) as
          | { effectiveMoisture?: Float32Array }
          | undefined;
        const effectiveMoisture = classification?.effectiveMoisture;
        if (!(effectiveMoisture instanceof Float32Array)) {
          throw new Error("Missing effectiveMoisture.");
        }
        return effectiveMoisture;
      });
    };

    const baseline = new Float32Array(size).fill(120);
    const boosted = new Float32Array(size).fill(120);
    // Simulate "upstream" (Hydrology) riparian influence baked into climateIndices.effectiveMoisture.
    boosted[2 * width + 2] += 8;
    boosted[2 * width + 3] += 8;

    const moistureBaseline = run(baseline);
    const moistureBoosted = run(boosted);

    const center = 2 * width + 2;
    const adjacent = 2 * width + 3;
    const far = 0;

    expect(moistureBoosted[center]! - moistureBaseline[center]!).toBe(8);
    expect(moistureBoosted[adjacent]! - moistureBaseline[adjacent]!).toBe(8);
    expect(moistureBoosted[far]! - moistureBaseline[far]!).toBe(0);
  });
});
