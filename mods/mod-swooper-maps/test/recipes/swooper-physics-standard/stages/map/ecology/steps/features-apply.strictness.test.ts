import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { ArtifactValidationError } from "@swooper/mapgen-core/authoring";
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
import { FeaturesApplyStep as featuresApplyStep } from "../../../../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/step.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 2, height: 2 } as const;
const FORGED_MISMATCHED_DIMENSIONS = { width: 1, height: 4 } as const;

describe("map-ecology features-apply strictness (M3-008)", () => {
  it("fails loudly when intents contain unknown feature keys", () => {
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    const ctx = createMapContext({ setup, adapter });

    expect(() =>
      withMapContextExecutionForTest(ctx, () => {
        publishTestArtifact(ctx, morphologyArtifactModules.topography, {
          elevation: new Int16Array(width * height),
          seaLevel: 0,
          landMask: new Uint8Array(width * height).fill(1),
          bathymetry: new Int16Array(width * height),
        });

        const vegetationIntent = { x: 0, y: 0, feature: "forest" } as const;
        publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsVegetation, [
          vegetationIntent,
        ]);
        // Simulate corrupted external evidence without widening the closed authored feature type.
        Reflect.set(vegetationIntent, "feature", "FEATURE_DOES_NOT_EXIST");
        publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsWetlands, []);
        publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsFloodplains, []);
        publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsReefs, []);
        publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsIce, []);

        const config = {
          apply: normalizeOperationSelectionForTest(
            ecology.ops.applyFeatures,
            ecology.ops.applyFeatures.defaultConfig
          ),
        };
        const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;
        featuresApplyStep.run(ctx, config, ops, buildStepTestDependencies(featuresApplyStep));
      })
    ).toThrow(/unknown feature intent/i);
    expect(ctx.artifacts.has(ecologyArtifacts.featureEngineSnapshot.id)).toBe(false);
  });

  it("keeps canHaveFeature rejections non-fatal and publishes diagnostics", () => {
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const adapter = createMockAdapter({
      width,
      height,
      canHaveFeature: () => false,
    });
    adapter.fillWater(false);
    const existingFeature = adapter.getFeatureTypeIndex("FEATURE_ICE");
    adapter.setFeatureType(1, 1, { Feature: existingFeature, Direction: -1, Elevation: 0 });
    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, () => {
      publishTestArtifact(ctx, morphologyArtifactModules.topography, {
        elevation: new Int16Array(width * height),
        seaLevel: 0,
        landMask: new Uint8Array(width * height).fill(1),
        bathymetry: new Int16Array(width * height),
      });

      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsVegetation, [
        { x: 0, y: 0, feature: "forest" },
      ]);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsWetlands, []);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsFloodplains, []);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsReefs, []);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsIce, []);

      const config = {
        apply: normalizeOperationSelectionForTest(
          ecology.ops.applyFeatures,
          ecology.ops.applyFeatures.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

      expect(() =>
        featuresApplyStep.run(ctx, config, ops, buildStepTestDependencies(featuresApplyStep))
      ).not.toThrow();
    });

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
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

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
    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, () => {
      publishTestArtifact(ctx, morphologyArtifactModules.topography, {
        elevation: new Int16Array(width * height),
        seaLevel: 0,
        landMask: new Uint8Array(width * height).fill(1),
        bathymetry: new Int16Array(width * height),
      });
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsVegetation, [
        { x: 0, y: 0, feature: "forest" },
      ]);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsWetlands, []);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsFloodplains, []);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsReefs, []);
      publishTestArtifact(ctx, ecologyArtifactModules.featureIntentsIce, []);

      const config = {
        apply: normalizeOperationSelectionForTest(
          ecology.ops.applyFeatures,
          ecology.ops.applyFeatures.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

      featuresApplyStep.run(ctx, config, ops, buildStepTestDependencies(featuresApplyStep));
    });

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
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const setup = admitMapSetup({
      mapSeed: 0,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const makeContext = () =>
      createMapContext({ setup, adapter: createMockAdapter({ width, height }) });

    const wrongDimensionsContext = makeContext();
    expect(() =>
      withMapContextExecutionForTest(wrongDimensionsContext, () =>
        publishTestArtifact(wrongDimensionsContext, ecologyArtifactModules.featureEngineSnapshot, {
          ...FORGED_MISMATCHED_DIMENSIONS,
          featureType: new Int16Array(4),
        })
      )
    ).toThrow(ArtifactValidationError);
    const wrongCardinalityContext = makeContext();
    expect(() =>
      withMapContextExecutionForTest(wrongCardinalityContext, () =>
        publishTestArtifact(wrongCardinalityContext, ecologyArtifactModules.featureEngineSnapshot, {
          ...SYNTHETIC_DIMENSIONS,
          featureType: new Int16Array(3),
        })
      )
    ).toThrow(ArtifactValidationError);
    const wrongTypeContext = makeContext();
    expect(() =>
      withMapContextExecutionForTest(wrongTypeContext, () =>
        publishTestArtifact(wrongTypeContext, ecologyArtifactModules.featureEngineSnapshot, {
          ...SYNTHETIC_DIMENSIONS,
          featureType: new Uint8Array(4),
        } as never)
      )
    ).toThrow(ArtifactValidationError);
  });
});
