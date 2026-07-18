import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifactModules } from "@swooper/mapgen-core/authoring";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { PlanReefsStep as planReefsStep } from "../../../../../../src/recipes/standard/stages/ecology-features/steps/plan-reefs/step.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { normalizeOpSelectionOrThrow } from "../../../../../support/compiler-helpers.js";
import { createEmptyFeatureScoreLayers } from "../../../../../support/feature-score-layers.js";
import { buildTestDeps } from "../../../../../support/step-deps.js";

describe("ecology-features plan-reefs step", () => {
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

    const layers = createEmptyFeatureScoreLayers(size);
    layers.reef.fill(1);

    const stageArtifacts = implementArtifactModules([
      ecologyArtifactModules.scoreLayers,
      ecologyArtifactModules.occupancyIce,
      hydrologyHydrographyArtifactModules.lakePlan,
    ]);
    stageArtifacts.scoreLayers.publish(ctx, { width, height, layers });
    stageArtifacts.occupancyIce.publish(ctx, {
      width,
      height,
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    });
    stageArtifacts.lakePlan.publish(ctx, {
      width,
      height,
      lakeMask: new Uint8Array(size),
      plannedLakeTileCount: 0,
      sinkLakeCount: 0,
    });

    const config = {
      planReefs: normalizeOpSelectionOrThrow(
        ecology.ops.planReefs,
        ecology.ops.planReefs.defaultConfig
      ),
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
    expect(occupancy.featureOccupancyMask instanceof Uint8Array).toBe(true);
    expect(occupancy.reserved instanceof Uint8Array).toBe(true);
  });
});
