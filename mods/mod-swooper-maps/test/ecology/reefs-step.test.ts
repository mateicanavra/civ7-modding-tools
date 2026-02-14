import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import planReefsStep from "../../src/recipes/standard/stages/ecology-reefs/steps/plan-reefs/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("ecology-reefs plan-reefs step", () => {
  it("publishes reef intents and occupancy snapshot", () => {
    const width = 3;
    const height = 2;
    const size = width * height;
    const env = {
      seed: 123,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(true);

    const ctx = createExtendedMapContext({ width, height }, adapter, env);
    ctx.buffers.heightfield.landMask.fill(0);

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
    layers.FEATURE_REEF.fill(1);

    const stageArtifacts = implementArtifacts(
      [ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyIce],
      { scoreLayers: {}, occupancyIce: {} }
    );
    stageArtifacts.scoreLayers.publish(ctx, { width, height, layers });
    stageArtifacts.occupancyIce.publish(ctx, {
      width,
      height,
      featureIndex: new Uint16Array(size),
      reserved: new Uint8Array(size),
    });

    const config = {
      planReefs: normalizeOpSelectionOrThrow(ecology.ops.planReefs, {
        strategy: "default",
        config: {},
      }),
    };
    const ops = ecology.ops.bind(planReefsStep.contract.ops!).runtime;
    planReefsStep.run(ctx, config, ops, buildTestDeps(planReefsStep));

    const intents = ctx.artifacts.get(ecologyArtifacts.featureIntentsReefs.id);
    expect(intents).toBeTruthy();
    expect(Array.isArray(intents)).toBe(true);
    expect((intents as unknown[]).length).toBeGreaterThan(0);

    const occupancy = ctx.artifacts.get(ecologyArtifacts.occupancyReefs.id) as any;
    expect(occupancy).toBeTruthy();
    expect(occupancy.width).toBe(width);
    expect(occupancy.height).toBe(height);
    expect(occupancy.featureIndex instanceof Uint16Array).toBe(true);
    expect(occupancy.reserved instanceof Uint8Array).toBe(true);
  });
});
