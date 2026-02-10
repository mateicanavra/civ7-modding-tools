import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import featuresApplyStep from "../../src/recipes/standard/stages/map-ecology/steps/features-apply/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("map-ecology features-apply strictness (M3-008)", () => {
  it("fails loudly when intents contain unknown feature keys", () => {
    const width = 2;
    const height = 2;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    const stageArtifacts = implementArtifacts(
      [
        ecologyArtifacts.featureIntentsVegetation,
        ecologyArtifacts.featureIntentsWetlands,
        ecologyArtifacts.featureIntentsReefs,
        ecologyArtifacts.featureIntentsIce,
      ],
      { featureIntentsVegetation: {}, featureIntentsWetlands: {}, featureIntentsReefs: {}, featureIntentsIce: {} }
    );

    stageArtifacts.featureIntentsVegetation.publish(ctx, [
      { x: 0, y: 0, feature: "FEATURE_DOES_NOT_EXIST" },
    ]);
    stageArtifacts.featureIntentsWetlands.publish(ctx, []);
    stageArtifacts.featureIntentsReefs.publish(ctx, []);
    stageArtifacts.featureIntentsIce.publish(ctx, []);

    const config = {
      apply: normalizeOpSelectionOrThrow(ecology.ops.applyFeatures, { strategy: "default", config: {} }),
    };
    const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

    expect(() => featuresApplyStep.run(ctx, config, ops, buildTestDeps(featuresApplyStep))).toThrow(
      /unknown feature keys/i
    );
  });
});

