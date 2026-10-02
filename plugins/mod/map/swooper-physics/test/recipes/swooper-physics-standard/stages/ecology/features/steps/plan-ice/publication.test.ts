import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as featureArtifacts } from "../../../../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { deriveFeatureOccupancy } from "../../../../../../../../src/recipes/standard/stages/ecology/features/model/policy/derive-feature-occupancy.js";
import { PlanIceStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-ice/step.js";
import { TEST_MAP_SEED } from "../../../../../../../setup.js";
import { createSurfaceWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";
import { createEmptyFeatureScoreLayers } from "../../fixtures/feature-score-layers.js";

describe("ecology-features plan-ice step", () => {
  it("declares final topography as its external-water eligibility authority", () => {
    expect(PlanIceStep.contract.requires).toContain(morphologyErosionArtifacts.topography);
  });

  for (const initiallyWet of [false, true]) {
    it(`leaves finite-water and exposed-land cells unclaimed at threshold zero: initiallyWet=${initiallyWet}`, () => {
      const width = 8;
      const height = 1;
      const size = width * height;
      const fixture = createSurfaceWaterFixture(width, height);
      const { topography, wetCell, dryCell } = fixture;
      if (initiallyWet) {
        topography.landMask[wetCell] = topography.landMask[dryCell] = 0;
      }
      const before = structuredClone(fixture);
      const layers = createEmptyFeatureScoreLayers(size);
      layers.ice.fill(1);
      layers.ice[0] = 0;
      const beforeLayers = structuredClone(layers);
      const setup = admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: { width, height },
        latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
      });
      const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
      let calls = 0;

      withMapContextExecutionForTest(context, (stepContext) => {
        publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, topography);
        publishTestArtifact(stepContext, featureArtifacts.featureSuitability, { width, height, layers });
        publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, [
          { x: dryCell, y: 0, feature: "grassland-floodplain-minor" },
        ]);
        const ops = ecology.features.ops.bind(PlanIceStep.contract.ops!);
        const config = {
          planIce: normalizeOperationSelectionForTest(ecology.features.ops.planIce, {
            strategy: "score-threshold", config: { minConfidence01: 0 },
          }),
        };
        const planIce: typeof ops.planIce = (input, operationConfig) => {
          calls++;
          expect(input.externalWaterMask).toBe(topography.externalWaterMask);
          expect(input.score01).toBe(layers.ice);
          expect(input.externalWaterMask[0]).toBe(1);
          expect(input.externalWaterMask[wetCell]).toBe(0);
          expect(input.externalWaterMask[dryCell]).toBe(0);
          expect(input.featureOccupancyMask[dryCell]).toBe(1);
          expect(input.featureOccupancyMask[0]).toBe(0);
          return ops.planIce(input, operationConfig);
        };
        PlanIceStep.run(stepContext, config, {
          ...ops,
          planIce,
        }, buildStepTestDependencies(PlanIceStep, stepContext));
      });

      const intents = readArtifact(context, featureArtifacts.iceIntents);
      const floodplainIntents = readArtifact(context, featureArtifacts.floodplainIntents);
      expect(calls).toBe(1);
      expect(intents).toEqual([{ x: 0, y: 0, feature: "ice" }]);
      const occupancy = deriveFeatureOccupancy({ width, height }, floodplainIntents, intents);
      expect(occupancy[0]).toBe(1);
      expect(occupancy[wetCell]).toBe(0);
      expect(occupancy[dryCell]).toBe(1);
      expect(fixture).toEqual(before);
      expect(layers).toEqual(beforeLayers);
    });
  }
});
