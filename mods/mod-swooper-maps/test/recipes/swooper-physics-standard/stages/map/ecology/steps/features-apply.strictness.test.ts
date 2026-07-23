import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { observeValidatedArtifact, readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as mapEcologyArtifacts } from "../../../../../../../src/recipes/standard/stages/map/ecology/artifacts/index.js";
import { FeaturesApplyStep as featuresApplyStep } from "../../../../../../../src/recipes/standard/stages/map/ecology/steps/features-apply/step.js";

const SYNTHETIC_DIMENSIONS = { width: 2, height: 2 } as const;

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
      withMapContextExecutionForTest(ctx, (stepContext) => {
        publishTestArtifact(stepContext, morphologyArtifacts.topography, {
          elevation: new Int16Array(width * height),
          seaLevel: 0,
          landMask: new Uint8Array(width * height).fill(1),
          bathymetry: new Int16Array(width * height),
        });

        const vegetationIntent = { x: 0, y: 0, feature: "forest" } as const;
        publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsVegetation, [
          vegetationIntent,
        ]);
        // Simulate corrupted external evidence without widening the closed authored feature type.
        Reflect.set(vegetationIntent, "feature", "FEATURE_DOES_NOT_EXIST");
        publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsWetlands, []);
        publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsFloodplains, []);
        publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsReefs, []);
        publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsIce, []);

        const config = {
          apply: normalizeOperationSelectionForTest(
            ecology.ops.applyFeatures,
            ecology.ops.applyFeatures.defaultConfig
          ),
        };
        const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;
        featuresApplyStep.run(
          stepContext,
          config,
          ops,
          buildStepTestDependencies(featuresApplyStep, stepContext)
        );
      })
    ).toThrow(/unknown feature intent/i);
    expect(observeValidatedArtifact(ctx, mapEcologyArtifacts.featureEngineSnapshot)).toEqual({
      found: false,
    });
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
    const existingFeature = 40_000;
    adapter.setFeatureType(1, 1, { Feature: existingFeature, Direction: -1, Elevation: 0 });
    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, (stepContext) => {
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation: new Int16Array(width * height),
        seaLevel: 0,
        landMask: new Uint8Array(width * height).fill(1),
        bathymetry: new Int16Array(width * height),
      });

      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsVegetation, [
        { x: 0, y: 0, feature: "forest" },
      ]);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsWetlands, []);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsFloodplains, []);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsReefs, []);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsIce, []);

      const config = {
        apply: normalizeOperationSelectionForTest(
          ecology.ops.applyFeatures,
          ecology.ops.applyFeatures.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

      expect(() =>
        featuresApplyStep.run(
          stepContext,
          config,
          ops,
          buildStepTestDependencies(featuresApplyStep, stepContext)
        )
      ).not.toThrow();
    });

    const diagnostics = readValidatedArtifact(ctx, mapEcologyArtifacts.featureApplyDiagnostics);
    expect(diagnostics.attempted).toBe(1);
    expect(diagnostics.applied).toBe(0);
    expect(diagnostics.rejected).toBe(1);
    expect(diagnostics.rejectedCanHaveFeature).toBe(1);
    expect(diagnostics.rejectedOutOfBounds).toBe(0);
    expect(diagnostics.rejectedUnknownFeature).toBe(0);
    expect(diagnostics.rejectionMask[0]).toBe(1);

    const snapshot = readValidatedArtifact(ctx, mapEcologyArtifacts.featureEngineSnapshot);
    expect(snapshot.width).toBe(width);
    expect(snapshot.height).toBe(height);
    expect(snapshot.featureType).toEqual(
      new Int32Array([adapter.NO_FEATURE, adapter.NO_FEATURE, adapter.NO_FEATURE, existingFeature])
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

    withMapContextExecutionForTest(ctx, (stepContext) => {
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation: new Int16Array(width * height),
        seaLevel: 0,
        landMask: new Uint8Array(width * height).fill(1),
        bathymetry: new Int16Array(width * height),
      });
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsVegetation, [
        { x: 0, y: 0, feature: "forest" },
      ]);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsWetlands, []);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsFloodplains, []);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsReefs, []);
      publishTestArtifact(stepContext, ecologyArtifacts.featureIntentsIce, []);

      const config = {
        apply: normalizeOperationSelectionForTest(
          ecology.ops.applyFeatures,
          ecology.ops.applyFeatures.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;

      featuresApplyStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(featuresApplyStep, stepContext)
      );
    });

    const snapshot = readValidatedArtifact(ctx, mapEcologyArtifacts.featureEngineSnapshot);
    expect(validationRan).toBe(true);
    expect(snapshot.featureType[0]).toBe(adapter.getFeatureTypeIndex("FEATURE_FOREST"));
    expect(snapshot.featureType[width]).toBe(validatedFeature);
    expect(snapshot.featureType).toEqual(
      new Int32Array([
        adapter.getFeatureType(0, 0),
        adapter.getFeatureType(1, 0),
        adapter.getFeatureType(0, 1),
        adapter.getFeatureType(1, 1),
      ])
    );
  });
});
