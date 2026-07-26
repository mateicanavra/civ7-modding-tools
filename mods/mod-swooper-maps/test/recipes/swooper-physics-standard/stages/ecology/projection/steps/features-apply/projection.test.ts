import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import ecology from "@mapgen/domain/ecology/router";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { FeaturesApplyStep as featuresApplyStep } from "../../../../../../../../src/recipes/standard/stages/ecology/projection/steps/features-apply/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";

describe("map-ecology features-apply step", () => {
  it("preserves the engine surface when Civ7 rejects an authored feature placement", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      canHaveFeature: () => false,
    });
    adapter.fillWater(false);
    const existingFeature = 40_000;
    adapter.setFeatureType(1, 1, { Feature: existingFeature, Direction: -1, Elevation: 0 });
    const ctx = createMapContext({ setup, adapter });

    const result = withMapContextExecutionForTest(ctx, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(width * height),
        seaLevel: 0,
        landMask: new Uint8Array(width * height).fill(1),
        bathymetry: new Int16Array(width * height),
      });

      publishTestArtifact(stepContext, featureArtifacts.vegetationIntents, [
        { x: 0, y: 0, feature: "forest" },
      ]);
      publishTestArtifact(stepContext, featureArtifacts.wetlandIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.reefIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.iceIntents, []);

      const config = {
        apply: normalizeOperationSelectionForTest(
          ecology.features.ops.applyFeatures,
          ecology.features.ops.applyFeatures.defaultConfig
        ),
      };
      const ops = ecology.features.ops.bind(featuresApplyStep.contract.ops!).runtime;

      const stepResult = featuresApplyStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(featuresApplyStep, stepContext)
      );
      if (stepResult instanceof Promise) {
        throw new Error("The features-apply step must remain synchronous.");
      }
      return stepResult;
    });

    expect(result.projectionMeasurementInput.attempted).toBe(1);
    expect(result.projectionMeasurementInput.applied).toBe(0);
    expect(result.projectionMeasurementInput.rejected).toBe(1);
    expect(result.projectionMeasurementInput.rejectedCanHaveFeature).toBe(1);
    expect(result.projectionMeasurementInput.rejectedOutOfBounds).toBe(0);
    expect(result.rejectionMask[0]).toBe(1);
    expect(result.featureType[0]).toBe(adapter.NO_FEATURE);
    expect(result.featureType[width + 1]).toBe(existingFeature);
    expect(adapter.getFeatureType(0, 0)).toBe(adapter.NO_FEATURE);
    expect(adapter.getFeatureType(1, 1)).toBe(existingFeature);
  });

  it("reads back final feature identity after terrain validation", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      canHaveFeature: () => true,
    });
    adapter.fillWater(false);
    const validatedFeature = adapter.getFeatureTypeIndex("FEATURE_ICE");
    const originalValidateAndFixTerrain = adapter.validateAndFixTerrain.bind(adapter);
    adapter.validateAndFixTerrain = () => {
      originalValidateAndFixTerrain();
      adapter.setFeatureType(0, 1, {
        Feature: validatedFeature,
        Direction: -1,
        Elevation: 0,
      });
    };
    const ctx = createMapContext({ setup, adapter });

    const result = withMapContextExecutionForTest(ctx, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(width * height),
        seaLevel: 0,
        landMask: new Uint8Array(width * height).fill(1),
        bathymetry: new Int16Array(width * height),
      });
      publishTestArtifact(stepContext, featureArtifacts.vegetationIntents, [
        { x: 0, y: 0, feature: "forest" },
      ]);
      publishTestArtifact(stepContext, featureArtifacts.wetlandIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.reefIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.iceIntents, []);

      const config = {
        apply: normalizeOperationSelectionForTest(
          ecology.features.ops.applyFeatures,
          ecology.features.ops.applyFeatures.defaultConfig
        ),
      };
      const ops = ecology.features.ops.bind(featuresApplyStep.contract.ops!).runtime;

      const stepResult = featuresApplyStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(featuresApplyStep, stepContext)
      );
      if (stepResult instanceof Promise) {
        throw new Error("The features-apply step must remain synchronous.");
      }
      return stepResult;
    });

    expect(result.featureType[0]).toBe(adapter.getFeatureTypeIndex("FEATURE_FOREST"));
    expect(result.featureType[width]).toBe(validatedFeature);
    expect(result.featureType).toEqual(
      Int32Array.from({ length: width * height }, (_, index) =>
        adapter.getFeatureType(index % width, Math.floor(index / width))
      )
    );
  });
});
