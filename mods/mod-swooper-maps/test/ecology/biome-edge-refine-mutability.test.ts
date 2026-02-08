import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology/ops";

import biomeEdgeRefineStep from "../../src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.js";
import biomesStep from "../../src/recipes/standard/stages/ecology/steps/biomes/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { hydrologyClimateBaselineArtifacts } from "../../src/recipes/standard/stages/hydrology-climate-baseline/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../../src/recipes/standard/stages/hydrology-climate-refine/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

function assertBiomeClassificationArtifact(value: unknown): asserts value is { biomeIndex: Uint8Array } {
  if (!value || typeof value !== "object") {
    throw new Error("Missing artifact:ecology.biomeClassification.");
  }
  const record = value as Record<string, unknown>;
  if (!(record.biomeIndex instanceof Uint8Array)) {
    throw new Error("Expected biomeClassification.biomeIndex to be a Uint8Array.");
  }
}

describe("M2 posture gate: biomeClassification mutability", () => {
  it("biome-edge-refine mutates biomeIndex in-place (publish-once mutable handle)", () => {
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

    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    ctx.buffers.heightfield.landMask.fill(1);
    ctx.buffers.heightfield.elevation.fill(1);
    ctx.buffers.climate.rainfall.fill(120);
    ctx.buffers.climate.humidity.fill(80);

    const upstreamArtifacts = implementArtifacts(
      [
        morphologyArtifacts.topography,
        hydrologyClimateBaselineArtifacts.climateField,
        hydrologyHydrographyArtifacts.hydrography,
        hydrologyClimateRefineArtifacts.cryosphere,
      ],
      { topography: {}, climateField: {}, hydrography: {}, cryosphere: {} }
    );

    const seaLevel = 0;
    const bathymetry = new Int16Array(size);
    upstreamArtifacts.topography.publish(ctx, {
      elevation: ctx.buffers.heightfield.elevation,
      seaLevel,
      landMask: ctx.buffers.heightfield.landMask,
      bathymetry,
    });
    upstreamArtifacts.climateField.publish(ctx, ctx.buffers.climate);
    upstreamArtifacts.hydrography.publish(ctx, {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });
    upstreamArtifacts.cryosphere.publish(ctx, {
      snowCover: new Uint8Array(size),
      seaIceCover: new Uint8Array(size),
      albedo: new Uint8Array(size),
      groundIce01: new Float32Array(size),
      permafrost01: new Float32Array(size),
      meltPotential01: new Float32Array(size),
    });

    const classifyConfig = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, {
      strategy: "default",
      config: { riparian: {} },
    });

    const biomesOps = ecology.ops.bind(biomesStep.contract.ops!).runtime;
    biomesStep.run(
      ctx,
      {
        classify: classifyConfig,
      },
      biomesOps,
      buildTestDeps(biomesStep)
    );

    const artifactId = ecologyArtifacts.biomeClassification.id;
    const artifactBefore = ctx.artifacts.get(artifactId);
    assertBiomeClassificationArtifact(artifactBefore);
    const biomeIndexBefore = artifactBefore.biomeIndex;

    const refineOps = ecology.ops.bind(biomeEdgeRefineStep.contract.ops!).runtime;
    biomeEdgeRefineStep.run(
      ctx,
      {
        refine: ecology.ops.refineBiomeEdges.defaultConfig,
      },
      refineOps,
      buildTestDeps(biomeEdgeRefineStep)
    );

    const artifactAfter = ctx.artifacts.get(artifactId);
    expect(artifactAfter).toBe(artifactBefore);

    assertBiomeClassificationArtifact(artifactAfter);
    expect(artifactAfter.biomeIndex).toBe(biomeIndexBefore);
  });
});

