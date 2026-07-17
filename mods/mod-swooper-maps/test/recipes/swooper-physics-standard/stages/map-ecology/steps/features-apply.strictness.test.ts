import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifactModules } from "@swooper/mapgen-core/authoring";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import featuresApplyStep from "../../../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/index.js";
import { normalizeOpSelectionOrThrow } from "../../../../../support/compiler-helpers.js";
import { buildTestDeps } from "../../../../../support/step-deps.js";

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

    const stageArtifacts = implementArtifactModules([
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.featureIntentsFloodplains,
      ecologyArtifactModules.featureIntentsReefs,
      ecologyArtifactModules.featureIntentsIce,
    ]);

    ctx.artifacts.set(ecologyArtifacts.featureIntentsVegetation.id, [
      { x: 0, y: 0, feature: "FEATURE_DOES_NOT_EXIST" },
    ]);
    stageArtifacts.featureIntentsWetlands.publish(ctx, []);
    stageArtifacts.featureIntentsFloodplains.publish(ctx, []);
    stageArtifacts.featureIntentsReefs.publish(ctx, []);
    stageArtifacts.featureIntentsIce.publish(ctx, []);

    const config = {
      apply: normalizeOpSelectionOrThrow(
        ecology.ops.applyFeatures,
        ecology.ops.applyFeatures.defaultConfig
      ),
    };
    const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

    expect(() => featuresApplyStep.run(ctx, config, ops, buildTestDeps(featuresApplyStep))).toThrow(
      /unknown feature intent/i
    );
  });

  it("keeps canHaveFeature rejections non-fatal and publishes diagnostics", () => {
    const width = 2;
    const height = 2;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({
      width,
      height,
      canHaveFeature: () => false,
    });
    adapter.fillWater(false);
    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    const stageArtifacts = implementArtifactModules([
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.featureIntentsFloodplains,
      ecologyArtifactModules.featureIntentsReefs,
      ecologyArtifactModules.featureIntentsIce,
    ]);

    stageArtifacts.featureIntentsVegetation.publish(ctx, [{ x: 0, y: 0, feature: "forest" }]);
    stageArtifacts.featureIntentsWetlands.publish(ctx, []);
    stageArtifacts.featureIntentsFloodplains.publish(ctx, []);
    stageArtifacts.featureIntentsReefs.publish(ctx, []);
    stageArtifacts.featureIntentsIce.publish(ctx, []);

    const config = {
      apply: normalizeOpSelectionOrThrow(
        ecology.ops.applyFeatures,
        ecology.ops.applyFeatures.defaultConfig
      ),
    };
    const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

    expect(() =>
      featuresApplyStep.run(ctx, config, ops, buildTestDeps(featuresApplyStep))
    ).not.toThrow();

    const diagnostics = ctx.artifacts.get(ecologyArtifacts.featureApplyDiagnostics.id) as
      | {
          attempted: number;
          applied: number;
          rejected: number;
          rejectedCanHaveFeature: number;
          rejectedOutOfBounds: number;
          rejectedUnknownFeature: number;
          rejectionMask: Uint8Array;
        }
      | undefined;
    expect(diagnostics).toBeDefined();
    expect(diagnostics?.attempted).toBe(1);
    expect(diagnostics?.applied).toBe(0);
    expect(diagnostics?.rejected).toBe(1);
    expect(diagnostics?.rejectedCanHaveFeature).toBe(1);
    expect(diagnostics?.rejectedOutOfBounds).toBe(0);
    expect(diagnostics?.rejectedUnknownFeature).toBe(0);
    expect(diagnostics?.rejectionMask[0]).toBe(1);
  });
});
