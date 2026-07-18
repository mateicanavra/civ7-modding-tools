import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { ArtifactValidationError, implementArtifactModules } from "@swooper/mapgen-core/authoring";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { FeaturesApplyStep as featuresApplyStep } from "../../../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/step.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
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
      morphologyArtifactModules.topography,
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.featureIntentsFloodplains,
      ecologyArtifactModules.featureIntentsReefs,
      ecologyArtifactModules.featureIntentsIce,
    ]);

    stageArtifacts.topography.publish(ctx, {
      elevation: new Int16Array(width * height),
      seaLevel: 0,
      landMask: new Uint8Array(width * height).fill(1),
      bathymetry: new Int16Array(width * height),
    });

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
    expect(ctx.artifacts.has(ecologyArtifacts.featureEngineSnapshot.id)).toBe(false);
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
    const existingFeature = adapter.getFeatureTypeIndex("FEATURE_ICE");
    adapter.setFeatureType(1, 1, { Feature: existingFeature, Direction: -1, Elevation: 0 });
    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    const stageArtifacts = implementArtifactModules([
      morphologyArtifactModules.topography,
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.featureIntentsFloodplains,
      ecologyArtifactModules.featureIntentsReefs,
      ecologyArtifactModules.featureIntentsIce,
    ]);

    stageArtifacts.topography.publish(ctx, {
      elevation: new Int16Array(width * height),
      seaLevel: 0,
      landMask: new Uint8Array(width * height).fill(1),
      bathymetry: new Int16Array(width * height),
    });

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

    const snapshot = ctx.artifacts.get(ecologyArtifacts.featureEngineSnapshot.id) as
      | { width: number; height: number; featureType: Int16Array }
      | undefined;
    expect(snapshot).toBeDefined();
    expect(snapshot?.width).toBe(width);
    expect(snapshot?.height).toBe(height);
    expect(snapshot?.featureType).toEqual(
      new Int16Array([adapter.NO_FEATURE, adapter.NO_FEATURE, adapter.NO_FEATURE, existingFeature])
    );
  });

  it("publishes the complete engine surface after terrain validation", () => {
    const width = 2;
    const height = 2;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height, canHaveFeature: () => true });
    adapter.fillWater(false);
    const validatedFeature = adapter.getFeatureTypeIndex("FEATURE_ICE");
    const originalValidateAndFixTerrain = adapter.validateAndFixTerrain.bind(adapter);
    let validationRan = false;
    adapter.validateAndFixTerrain = () => {
      originalValidateAndFixTerrain();
      validationRan = true;
      adapter.setFeatureType(0, 1, {
        Feature: validatedFeature,
        Direction: -1,
        Elevation: 0,
      });
    };
    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    const stageArtifacts = implementArtifactModules([
      morphologyArtifactModules.topography,
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.featureIntentsFloodplains,
      ecologyArtifactModules.featureIntentsReefs,
      ecologyArtifactModules.featureIntentsIce,
    ]);
    stageArtifacts.topography.publish(ctx, {
      elevation: new Int16Array(width * height),
      seaLevel: 0,
      landMask: new Uint8Array(width * height).fill(1),
      bathymetry: new Int16Array(width * height),
    });
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

    featuresApplyStep.run(ctx, config, ops, buildTestDeps(featuresApplyStep));

    const snapshot = ctx.artifacts.get(ecologyArtifacts.featureEngineSnapshot.id) as {
      featureType: Int16Array;
    };
    expect(validationRan).toBe(true);
    expect(snapshot.featureType[0]).toBe(adapter.getFeatureTypeIndex("FEATURE_FOREST"));
    expect(snapshot.featureType[width]).toBe(validatedFeature);
    expect(snapshot.featureType).toEqual(
      new Int16Array([
        adapter.getFeatureType(0, 0),
        adapter.getFeatureType(1, 0),
        adapter.getFeatureType(0, 1),
        adapter.getFeatureType(1, 1),
      ])
    );
  });

  it("refuses feature snapshots with the wrong dimensions, type, or cardinality", () => {
    const width = 2;
    const height = 2;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };
    const runtime = implementArtifactModules([ecologyArtifactModules.featureEngineSnapshot]);

    const makeContext = () =>
      createExtendedMapContext({ width, height }, createMockAdapter({ width, height }), env);

    expect(() =>
      runtime.featureEngineSnapshot.publish(makeContext(), {
        width: 1,
        height: 4,
        featureType: new Int16Array(4),
      })
    ).toThrow(ArtifactValidationError);
    expect(() =>
      runtime.featureEngineSnapshot.publish(makeContext(), {
        width,
        height,
        featureType: new Int16Array(3),
      })
    ).toThrow(ArtifactValidationError);
    expect(() =>
      runtime.featureEngineSnapshot.publish(makeContext(), {
        width,
        height,
        featureType: new Uint8Array(4),
      } as never)
    ).toThrow(ArtifactValidationError);
  });
});
