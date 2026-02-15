import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology/ops";

import biomesStep from "../../src/recipes/standard/stages/ecology/steps/biomes/index.js";
import plotBiomesStep from "../../src/recipes/standard/stages/map-ecology/steps/plotBiomes.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../../src/recipes/standard/stages/hydrology-climate-refine/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("biomes step", () => {
  it("assigns marine biome to water tiles", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    adapter.setWater(0, 0, true);

    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    ctx.buffers.heightfield.landMask.fill(1);
    ctx.buffers.heightfield.landMask[0] = 0;
    ctx.buffers.heightfield.elevation.fill(1);
    ctx.buffers.heightfield.elevation[0] = 0;

    const requiredArtifacts = implementArtifacts(
      [
        morphologyArtifacts.topography,
        hydrologyClimateRefineArtifacts.cryosphere,
        hydrologyClimateRefineArtifacts.climateIndices,
        ecologyArtifacts.pedology,
      ],
      { topography: {}, cryosphere: {}, climateIndices: {}, pedology: {} }
    );

    requiredArtifacts.topography.publish(ctx, {
      elevation: ctx.buffers.heightfield.elevation,
      seaLevel: 0,
      landMask: ctx.buffers.heightfield.landMask,
      bathymetry: new Int16Array(size),
    });
    requiredArtifacts.cryosphere.publish(ctx, {
      snowCover: new Uint8Array(size),
      seaIceCover: new Uint8Array(size),
      albedo: new Uint8Array(size),
      groundIce01: new Float32Array(size),
      permafrost01: new Float32Array(size),
      meltPotential01: new Float32Array(size),
    });
    requiredArtifacts.climateIndices.publish(ctx, {
      surfaceTemperatureC: new Float32Array(size).fill(15),
      effectiveMoisture: new Float32Array(size).fill(160),
      pet: new Float32Array(size),
      aridityIndex: new Float32Array(size).fill(0.2),
      freezeIndex: new Float32Array(size).fill(0.05),
    });
    requiredArtifacts.pedology.publish(ctx, {
      width,
      height,
      soilType: new Uint8Array(size).fill(0),
      fertility: new Float32Array(size).fill(0.5),
    });

    const classifyConfig = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, ecology.ops.classifyBiomes.defaultConfig);

    const ops = ecology.ops.bind(biomesStep.contract.ops!).runtime;
    biomesStep.run(ctx, { classify: classifyConfig }, ops, buildTestDeps(biomesStep));

    plotBiomesStep.run(ctx, { bindings: {} }, {}, buildTestDeps(plotBiomesStep));

    const marineId = adapter.getBiomeGlobal("BIOME_MARINE");
    expect(ctx.fields.biomeId[0]).toBe(marineId);

    const landIdx = 1;
    expect(ctx.fields.biomeId[landIdx]).not.toBe(marineId);
    expect(ctx.fields.biomeId[landIdx]).toBeGreaterThanOrEqual(0);
  });

  it("uses hydrology climateIndices for temperature/aridity/freeze (no local re-derive)", () => {
    const width = 3;
    const height = 1;
    const size = width * height;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    ctx.buffers.heightfield.landMask.fill(1);
    ctx.buffers.heightfield.elevation.fill(1);

    const requiredArtifacts = implementArtifacts(
      [
        morphologyArtifacts.topography,
        hydrologyClimateRefineArtifacts.cryosphere,
        hydrologyClimateRefineArtifacts.climateIndices,
        ecologyArtifacts.pedology,
      ],
      { topography: {}, cryosphere: {}, climateIndices: {}, pedology: {} }
    );

    requiredArtifacts.topography.publish(ctx, {
      elevation: ctx.buffers.heightfield.elevation,
      seaLevel: 0,
      landMask: ctx.buffers.heightfield.landMask,
      bathymetry: new Int16Array(size),
    });
    requiredArtifacts.cryosphere.publish(ctx, {
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
    requiredArtifacts.climateIndices.publish(ctx, {
      surfaceTemperatureC,
      effectiveMoisture: effectiveMoistureIn,
      pet: new Float32Array(size),
      aridityIndex,
      freezeIndex,
    });
    requiredArtifacts.pedology.publish(ctx, {
      width,
      height,
      soilType: new Uint8Array(size).fill(0),
      fertility: new Float32Array(size).fill(0.5),
    });

    const classifyConfig = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, ecology.ops.classifyBiomes.defaultConfig);

    const ops = ecology.ops.bind(biomesStep.contract.ops!).runtime;
    biomesStep.run(ctx, { classify: classifyConfig }, ops, buildTestDeps(biomesStep));

    const classification = ctx.artifacts.get(ecologyArtifacts.biomeClassification.id) as
      | {
          surfaceTemperature?: Float32Array;
          effectiveMoisture?: Float32Array;
          aridityIndex?: Float32Array;
          freezeIndex?: Float32Array;
        }
      | undefined;
    if (!(classification?.surfaceTemperature instanceof Float32Array)) throw new Error("Missing surfaceTemperature.");
    if (!(classification?.effectiveMoisture instanceof Float32Array)) throw new Error("Missing effectiveMoisture.");
    if (!(classification?.aridityIndex instanceof Float32Array)) throw new Error("Missing aridityIndex.");
    if (!(classification?.freezeIndex instanceof Float32Array)) throw new Error("Missing freezeIndex.");

    expect(Array.from(classification.surfaceTemperature)).toEqual(Array.from(surfaceTemperatureC));
    expect(Array.from(classification.effectiveMoisture)).toEqual(Array.from(effectiveMoistureIn));
    expect(Array.from(classification.aridityIndex)).toEqual(Array.from(aridityIndex));
    expect(Array.from(classification.freezeIndex)).toEqual(Array.from(freezeIndex));
  });

  it("forwards hydrology effectiveMoisture (no local riparian logic)", () => {
    const width = 5;
    const height = 5;
    const size = width * height;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const classifyConfig = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, ecology.ops.classifyBiomes.defaultConfig);

    const run = (effectiveMoistureIn: Float32Array): Float32Array => {
      const adapter = createMockAdapter({ width, height });
      adapter.fillWater(false);

      const ctx = createExtendedMapContext({ width, height }, adapter, env);

      ctx.buffers.heightfield.landMask.fill(1);
      ctx.buffers.heightfield.elevation.fill(1);

      const requiredArtifacts = implementArtifacts(
        [
          morphologyArtifacts.topography,
          hydrologyClimateRefineArtifacts.cryosphere,
          hydrologyClimateRefineArtifacts.climateIndices,
          ecologyArtifacts.pedology,
        ],
        { topography: {}, cryosphere: {}, climateIndices: {}, pedology: {} }
      );

      requiredArtifacts.topography.publish(ctx, {
        elevation: ctx.buffers.heightfield.elevation,
        seaLevel: 0,
        landMask: ctx.buffers.heightfield.landMask,
        bathymetry: new Int16Array(size),
      });
      requiredArtifacts.cryosphere.publish(ctx, {
        snowCover: new Uint8Array(size),
        seaIceCover: new Uint8Array(size),
        albedo: new Uint8Array(size),
        groundIce01: new Float32Array(size),
        permafrost01: new Float32Array(size),
        meltPotential01: new Float32Array(size),
      });
      requiredArtifacts.climateIndices.publish(ctx, {
        surfaceTemperatureC: new Float32Array(size).fill(15),
        effectiveMoisture: effectiveMoistureIn,
        pet: new Float32Array(size),
        aridityIndex: new Float32Array(size).fill(0.2),
        freezeIndex: new Float32Array(size).fill(0.05),
      });
      requiredArtifacts.pedology.publish(ctx, {
        width,
        height,
        soilType: new Uint8Array(size).fill(0),
        fertility: new Float32Array(size).fill(0.5),
      });

      const ops = ecology.ops.bind(biomesStep.contract.ops!).runtime;
      biomesStep.run(ctx, { classify: classifyConfig }, ops, buildTestDeps(biomesStep));

      const classification = ctx.artifacts.get(ecologyArtifacts.biomeClassification.id) as
        | { effectiveMoisture?: Float32Array }
        | undefined;
      const effectiveMoisture = classification?.effectiveMoisture;
      if (!(effectiveMoisture instanceof Float32Array)) {
        throw new Error("Missing effectiveMoisture.");
      }
      return effectiveMoisture;
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

