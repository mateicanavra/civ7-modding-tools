import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";
import { RIVER_CLASS_MAJOR } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanFloodplainsStep } from "../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-floodplains/step.js";
import { TEST_MAP_SIZE } from "../../../../../../map-size.js";
import { createEmptyFeatureScoreLayers } from "../fixtures/feature-score-layers.js";

const FLOODPLAIN_INTENT_KEYS = new Set([
  "desert-floodplain-minor",
  "desert-floodplain-navigable",
  "grassland-floodplain-minor",
  "grassland-floodplain-navigable",
  "plains-floodplain-minor",
  "plains-floodplain-navigable",
  "tropical-floodplain-minor",
  "tropical-floodplain-navigable",
  "tundra-floodplain-minor",
  "tundra-floodplain-navigable",
]);

describe("ecology-features plan-floodplains step", () => {
  it("publishes an admitted floodplain intent from lowland high-discharge substrate", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverIndex = Math.floor(height / 2) * width + Math.floor(width / 2);
    const landMask = new Uint8Array(size).fill(1);
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    const discharge = new Float32Array(size);
    riverClass[riverIndex] = RIVER_CLASS_MAJOR;
    navigableRiverMask[riverIndex] = 1;
    discharge[riverIndex] = 160;

    const substrate = ecology.ops.computeFeatureSubstrate.run(
      {
        ...TEST_MAP_SIZE.dimensions,
        riverClass,
        navigableRiverMask,
        landMask,
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge,
        sinkMask: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(ecology.ops.computeFeatureSubstrate, {
        ...ecology.ops.computeFeatureSubstrate.defaultConfig,
        config: {
          ...ecology.ops.computeFeatureSubstrate.defaultConfig.config,
          lowlandMaxElevationAboveSeaM: 80,
          floodplainDischargeMin: 96,
        },
      })
    );
    const layers = createEmptyFeatureScoreLayers(size);
    layers["plains-floodplain-navigable"][riverIndex] = 1;

    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: 24681357,
        dimensions: TEST_MAP_SIZE.dimensions,
        latitudeBounds: {
          topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
          bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
        },
      }),
      adapter: createMockAdapter({
        ...TEST_MAP_SIZE.dimensions,
        mapInfo: TEST_MAP_SIZE.mapInfo,
        mapSizeId: TEST_MAP_SIZE.id,
      }),
    });

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, ecologyArtifacts.scoreLayers, {
        ...TEST_MAP_SIZE.dimensions,
        layers,
      });
      publishTestArtifact(stepContext, ecologyArtifacts.occupancyBase, {
        ...TEST_MAP_SIZE.dimensions,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      const dependencies = buildStepTestDependencies(PlanFloodplainsStep);
      PlanFloodplainsStep.run(
        stepContext,
        {
          planFloodplains: normalizeOperationSelectionForTest(ecology.ops.planFloodplains, {
            ...ecology.ops.planFloodplains.defaultConfig,
            config: {
              ...ecology.ops.planFloodplains.defaultConfig.config,
              minConfidence01: 0.5,
            },
          }),
        },
        ecology.ops.bind(PlanFloodplainsStep.contract.ops!).runtime,
        dependencies
      );
    });
    const intents = readValidatedArtifact(context, ecologyArtifacts.featureIntentsFloodplains);

    expect(intents).toHaveLength(1);
    expect(intents[0]).toMatchObject({
      x: riverIndex % width,
      y: Math.floor(riverIndex / width),
    });
    expect(FLOODPLAIN_INTENT_KEYS.has(intents?.[0]?.feature ?? "")).toBe(true);
    expect(substrate.floodplainMask[riverIndex]).toBe(1);
  });
});
