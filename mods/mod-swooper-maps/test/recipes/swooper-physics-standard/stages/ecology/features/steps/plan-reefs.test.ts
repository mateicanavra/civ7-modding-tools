import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifactModules as ecologyArtifactModules } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";
import { artifactModules as hydrologyHydrographyArtifactModules } from "@mapgen/domain/hydrology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanReefsStep as planReefsStep } from "../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-reefs/step.js";
import { TEST_MAP_SIZE } from "../../../../../../map-size.js";
import { createEmptyFeatureScoreLayers } from "../fixtures/feature-score-layers.js";

describe("ecology-features plan-reefs step", () => {
  it("publishes reef intents and occupancy snapshot", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 123,
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
    adapter.fillWater(true);

    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, (stepContext) => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.reef.fill(1);

      publishTestArtifact(stepContext, ecologyArtifactModules.scoreLayers, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, ecologyArtifactModules.occupancyIce, {
        width,
        height,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, hydrologyHydrographyArtifactModules.lakePlan, {
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
      planReefsStep.run(stepContext, config, ops, buildStepTestDependencies(planReefsStep));
    });

    const intents = readValidatedArtifact(ctx, ecologyArtifactModules.featureIntentsReefs);
    expect(Array.isArray(intents)).toBe(true);
    expect(intents.length).toBeGreaterThan(0);

    const occupancy = readValidatedArtifact(ctx, ecologyArtifactModules.occupancyReefs);
    expect(occupancy.width).toBe(width);
    expect(occupancy.height).toBe(height);
    expect(occupancy.featureOccupancyMask instanceof Uint8Array).toBe(true);
    expect(occupancy.reserved instanceof Uint8Array).toBe(true);
  });
});
