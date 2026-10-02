import { createEmptyWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";
import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as featureArtifacts } from "../../../../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { observeArtifact, readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanReefsStep as planReefsStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-reefs/step.js";
import {
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../../../../../setup.js";
import { createEmptyFeatureScoreLayers } from "../../fixtures/feature-score-layers.js";

describe("ecology-features plan-reefs step", () => {
  it("uses the real spatial planner with upstream ice occupancy and published lake truth", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
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
      layers.reef[0] = 1;
      layers.reef[1] = 0.875;
      layers.lotus[3] = 1;
      layers.lotus[4] = 0.75;
      const lakeMask = new Uint8Array(size);
      lakeMask[4] = 1;

      publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.iceIntents, [{ x: 0, y: 0, feature: "ice" }]);
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, createEmptyWaterFixture(width, height, lakeMask).lakePlan);

      const config = {
        planReefs: normalizeOperationSelectionForTest(
          ecology.features.ops.planReefs,
          { strategy: "habitat", config: { minConfidence01: 0.5, minSpacingTiles: 2 } }
        ),
      };
      const ops = ecology.features.ops.bind(planReefsStep.contract.ops!);
      planReefsStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(planReefsStep, stepContext)
      );
    });

    const intents = readArtifact(ctx, featureArtifacts.reefIntents);
    expect(intents).toEqual([
      { x: 1, y: 0, feature: "reef" },
      { x: 4, y: 0, feature: "lotus" },
    ]);
  });

  it("refuses an upstream collision before publishing reef intent", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
    });
    const ctx = createMapContext({ setup, adapter });
    const collision = { x: 1, y: 1 } as const;

    expect(() =>
      withMapContextExecutionForTest(ctx, (stepContext) => {
        publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
          width,
          height,
          layers: createEmptyFeatureScoreLayers(size),
        });
        publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, [
          { ...collision, feature: "grassland-floodplain-minor" },
        ]);
        publishTestArtifact(stepContext, featureArtifacts.iceIntents, []);
        publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, createEmptyWaterFixture(width, height).lakePlan);

        const config = {
          planReefs: normalizeOperationSelectionForTest(
            ecology.features.ops.planReefs,
            ecology.features.ops.planReefs.defaultConfig
          ),
        };
        const ops = ecology.features.ops.bind(planReefsStep.contract.ops!);
        const planReefs: typeof ops.planReefs = () => ({
          placements: [{ ...collision, feature: "reef" as const }],
        });

        planReefsStep.run(
          stepContext,
          config,
          { ...ops, planReefs },
          buildStepTestDependencies(planReefsStep, stepContext)
        );
      })
    ).toThrow("occupied tile");

    expect(observeArtifact(ctx, featureArtifacts.reefIntents)).toEqual({
      found: false,
    });
  });
});
