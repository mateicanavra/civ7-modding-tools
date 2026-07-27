import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import ecology from "@mapgen/domain/ecology/router";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { observeValidatedArtifact, readValidatedArtifact } from "@swooper/mapgen-core/authoring";
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
  it("publishes reef intent after admitted upstream feature intents", () => {
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
      layers.reef.fill(1);

      publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.iceIntents, []);
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

    const intents = readValidatedArtifact(ctx, featureArtifacts.reefIntents);
    expect(intents.length).toBeGreaterThan(0);
    expect(intents.every(({ feature }) => feature === "reef")).toBe(true);
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
        const runtimeOps = ecology.features.ops.bind(planReefsStep.contract.ops!).runtime;
        const planReefs = Object.assign(
          () => ({ placements: [{ ...collision, feature: "reef" as const }] }),
          {
            id: runtimeOps.planReefs.id,
            kind: runtimeOps.planReefs.kind,
          }
        );

        planReefsStep.run(
          stepContext,
          config,
          { ...runtimeOps, planReefs },
          buildStepTestDependencies(planReefsStep)
        );
      })
    ).toThrow("occupied tile");

    expect(observeValidatedArtifact(ctx, featureArtifacts.reefIntents)).toEqual({
      found: false,
    });
  });
});
