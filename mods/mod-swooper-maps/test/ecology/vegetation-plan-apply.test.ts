import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import planVegetationStep from "../../src/recipes/standard/stages/ecology-vegetation/steps/plan-vegetation/index.js";
import featuresApplyStep from "../../src/recipes/standard/stages/map-ecology/steps/features-apply/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("plan-vegetation/apply pipeline", () => {
  it("publishes vegetation intents and applies placements", () => {
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
    ctx.buffers.heightfield.elevation.fill(100);

    const f32 = () => new Float32Array(size);
    const layers = {
      FEATURE_FOREST: f32(),
      FEATURE_RAINFOREST: f32(),
      FEATURE_TAIGA: f32(),
      FEATURE_SAVANNA_WOODLAND: f32(),
      FEATURE_SAGEBRUSH_STEPPE: f32(),
      FEATURE_MARSH: f32(),
      FEATURE_TUNDRA_BOG: f32(),
      FEATURE_MANGROVE: f32(),
      FEATURE_OASIS: f32(),
      FEATURE_WATERING_HOLE: f32(),
      FEATURE_REEF: f32(),
      FEATURE_COLD_REEF: f32(),
      FEATURE_ATOLL: f32(),
      FEATURE_LOTUS: f32(),
      FEATURE_ICE: f32(),
    } as const;
    layers.FEATURE_FOREST.fill(1);

    const stageArtifacts = implementArtifacts(
      [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyWetlands, morphologyArtifacts.topography],
      { scoreLayers: {}, occupancyWetlands: {}, topography: {} }
    );

    stageArtifacts.scoreLayers.publish(ctx, { width, height, layers });
    stageArtifacts.occupancyWetlands.publish(ctx, {
      width,
      height,
      featureIndex: new Uint16Array(size),
      reserved: new Uint8Array(size),
    });
    stageArtifacts.topography.publish(ctx, {
      elevation: ctx.buffers.heightfield.elevation,
      seaLevel: 0,
      landMask: ctx.buffers.heightfield.landMask,
      bathymetry: new Int16Array(size),
    });

    const planConfig = {
      planVegetation: normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
        strategy: "default",
        config: { minScore01: 0.05 },
      }),
    };
    const planOps = ecology.ops.bind(planVegetationStep.contract.ops!).runtime;
    planVegetationStep.run(ctx, planConfig, planOps, buildTestDeps(planVegetationStep));

    // M3 stages: publish empty lists for non-vegetation families so the apply step has a complete surface.
    implementArtifacts([ecologyArtifacts.featureIntentsIce], { featureIntentsIce: {} }).featureIntentsIce.publish(ctx, []);
    implementArtifacts([ecologyArtifacts.featureIntentsReefs], { featureIntentsReefs: {} }).featureIntentsReefs.publish(
      ctx,
      []
    );
    implementArtifacts([ecologyArtifacts.featureIntentsWetlands], { featureIntentsWetlands: {} }).featureIntentsWetlands.publish(
      ctx,
      []
    );

    const vegetationIntents = ctx.artifacts.get(ecologyArtifacts.featureIntentsVegetation.id);
    expect(vegetationIntents).toBeTruthy();
    expect(Array.isArray(vegetationIntents)).toBe(true);
    expect((vegetationIntents as unknown[]).length).toBeGreaterThan(0);

    const applyConfig = {
      apply: normalizeOpSelectionOrThrow(ecology.ops.applyFeatures, { strategy: "default", config: {} }),
    };
    const applyOps = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;
    featuresApplyStep.run(ctx, applyConfig, applyOps, buildTestDeps(featuresApplyStep));

    const featureField = ctx.fields.featureType;
    expect(featureField).toBeDefined();
    if (!(featureField instanceof Int16Array)) throw new Error("Missing featureType field.");
    let applied = 0;
    for (let i = 0; i < featureField.length; i++) {
      if (featureField[i] !== -1) applied++;
    }
    expect(applied).toBeGreaterThan(0);
  });
});

