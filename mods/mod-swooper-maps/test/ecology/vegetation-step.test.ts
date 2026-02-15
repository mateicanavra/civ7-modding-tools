import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import planVegetationStep from "../../src/recipes/standard/stages/ecology-vegetation/steps/plan-vegetation/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("ecology-vegetation plan-vegetation step", () => {
  it("publishes vegetation intents and occupancy snapshot", () => {
    const width = 3;
    const height = 2;
    const size = width * height;
    const env = {
      seed: 123,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);

    const ctx = createExtendedMapContext({ width, height }, adapter, env);

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
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask: new Uint8Array(size).fill(1),
      bathymetry: new Int16Array(size),
    });

    const config = {
      planVegetation: normalizeOpSelectionOrThrow(ecology.ops.planVegetation, {
        strategy: "default",
        config: { minScore01: 0.15 },
      }),
    };
    const ops = ecology.ops.bind(planVegetationStep.contract.ops!).runtime;
    planVegetationStep.run(ctx, config, ops, buildTestDeps(planVegetationStep));

    const intents = ctx.artifacts.get(ecologyArtifacts.featureIntentsVegetation.id);
    expect(intents).toBeTruthy();
    expect(Array.isArray(intents)).toBe(true);
    expect((intents as unknown[]).length).toBeGreaterThan(0);

    const occupancy = ctx.artifacts.get(ecologyArtifacts.occupancyVegetation.id) as any;
    expect(occupancy).toBeTruthy();
    expect(occupancy.width).toBe(width);
    expect(occupancy.height).toBe(height);
    expect(occupancy.featureIndex instanceof Uint16Array).toBe(true);
    expect(occupancy.reserved instanceof Uint8Array).toBe(true);
  });
});

