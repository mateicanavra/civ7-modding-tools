import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import ecology from "@mapgen/domain/ecology/router";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanFloodplainsStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-floodplains/step.js";
import {
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../../../../../setup.js";
import { createEmptyFeatureScoreLayers } from "../../fixtures/feature-score-layers.js";

describe("ecology-features plan-floodplains step", () => {
  it("publishes floodplain intent from admitted feature suitability", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverIndex = Math.floor(height / 2) * width + Math.floor(width / 2);
    const layers = createEmptyFeatureScoreLayers(size);
    layers["plains-floodplain-navigable"][riverIndex] = 1;

    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: TEST_MAP_SIZE.dimensions,
        latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
      }),
      adapter: createMockAdapter({
        ...TEST_MAP_SIZE.dimensions,
        mapInfo: TEST_MAP_SIZE.mapInfo,
        mapSizeId: TEST_MAP_SIZE.id,
      }),
    });

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
        ...TEST_MAP_SIZE.dimensions,
        layers,
      });
      const dependencies = buildStepTestDependencies(PlanFloodplainsStep, stepContext);
      PlanFloodplainsStep.run(
        stepContext,
        {
          planFloodplains: normalizeOperationSelectionForTest(
            ecology.features.ops.planFloodplains,
            {
              ...ecology.features.ops.planFloodplains.defaultConfig,
              config: {
                ...ecology.features.ops.planFloodplains.defaultConfig.config,
                minConfidence01: 0.5,
              },
            }
          ),
        },
        ecology.features.ops.bind(PlanFloodplainsStep.contract.ops!),
        dependencies
      );
    });
    const intents = readValidatedArtifact(context, featureArtifacts.floodplainIntents);

    expect(intents).toEqual([
      {
        x: riverIndex % width,
        y: Math.floor(riverIndex / width),
        feature: "plains-floodplain-navigable",
      },
    ]);
  });
});
