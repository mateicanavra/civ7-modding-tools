import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import ecology from "@mapgen/domain/ecology/router";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanReefsStep as planReefsStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-reefs/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";
import { createEmptyFeatureScoreLayers } from "../../fixtures/feature-score-layers.js";

describe("ecology-features plan-reefs step", () => {
  it("publishes reef intent and advances occupancy without changing reservations", () => {
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
    adapter.fillWater(true);

    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, (stepContext) => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.reef.fill(1);

      publishTestArtifact(stepContext, featureArtifacts.scoreLayers, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, featureArtifacts.occupancyIce, {
        width,
        height,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, {
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
      });

      const config = {
        planReefs: normalizeOperationSelectionForTest(
          ecology.features.ops.planReefs,
          ecology.features.ops.planReefs.defaultConfig
        ),
      };
      const ops = ecology.features.ops.bind(planReefsStep.contract.ops!).runtime;
      planReefsStep.run(stepContext, config, ops, buildStepTestDependencies(planReefsStep));
    });

    const intents = readValidatedArtifact(ctx, featureArtifacts.featureIntentsReefs);
    expect(intents.length).toBeGreaterThan(0);
    expect(intents.every(({ feature }) => feature === "reef")).toBe(true);

    const occupancy = readValidatedArtifact(ctx, featureArtifacts.occupancyReefs);
    const occupiedCount = occupancy.featureOccupancyMask.reduce(
      (count, occupied) => count + (occupied === 1 ? 1 : 0),
      0
    );
    expect(occupiedCount).toBe(intents.length);
    expect(occupancy.reserved.every((reserved) => reserved === 0)).toBe(true);
  });
});
