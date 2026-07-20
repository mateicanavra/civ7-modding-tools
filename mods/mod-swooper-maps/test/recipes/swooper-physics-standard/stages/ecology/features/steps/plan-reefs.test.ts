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
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { PlanReefsStep as planReefsStep } from "../../../../../../../src/recipes/standard/stages/ecology-features/steps/plan-reefs/step.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { createEmptyFeatureScoreLayers } from "../fixtures/feature-score-layers.js";

describe("ecology-features plan-reefs step", () => {
  it("publishes reef intents and occupancy snapshot", () => {
    const syntheticDimensions = { width: 3, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 123,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(true);

    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, () => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.reef.fill(1);

      publishTestArtifact(ctx, ecologyArtifactModules.scoreLayers, { width, height, layers });
      publishTestArtifact(ctx, ecologyArtifactModules.occupancyIce, {
        width,
        height,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      publishTestArtifact(ctx, hydrologyHydrographyArtifactModules.lakePlan, {
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
      });

      const config = {
        planReefs: normalizeOperationSelectionForTest(
          ecology.ops.planReefs,
          ecology.ops.planReefs.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(planReefsStep.contract.ops!).runtime;
      planReefsStep.run(ctx, config, ops, buildStepTestDependencies(planReefsStep));

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
});
