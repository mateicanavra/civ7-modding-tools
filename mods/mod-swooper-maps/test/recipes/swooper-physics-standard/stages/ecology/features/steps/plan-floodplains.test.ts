import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { RIVER_CLASS_MAJOR } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifactModules as ecologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { PlanFloodplainsStep } from "../../../../../../../src/recipes/standard/stages/ecology-features/steps/plan-floodplains/step.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
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
    const syntheticDimensions = { width: 5, height: 3 } as const;
    const size = syntheticDimensions.width * syntheticDimensions.height;
    const riverIndex = 7;
    const landMask = new Uint8Array(size).fill(1);
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    const discharge = new Float32Array(size);
    riverClass[riverIndex] = RIVER_CLASS_MAJOR;
    navigableRiverMask[riverIndex] = 1;
    discharge[riverIndex] = 160;

    const substrate = ecology.ops.computeFeatureSubstrate.run(
      {
        ...syntheticDimensions,
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
        dimensions: syntheticDimensions,
        latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
      }),
      adapter: createMockAdapter(syntheticDimensions),
    });

    const intents = withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(context, ecologyArtifactModules.scoreLayers, {
        ...syntheticDimensions,
        layers,
      });
      publishTestArtifact(context, ecologyArtifactModules.occupancyBase, {
        ...syntheticDimensions,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      const dependencies = buildStepTestDependencies(PlanFloodplainsStep);
      PlanFloodplainsStep.run(
        context,
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
      return dependencies.artifacts.featureIntentsFloodplains.read(context);
    });

    expect(intents).toHaveLength(1);
    expect(intents[0]).toMatchObject({
      x: riverIndex % syntheticDimensions.width,
      y: Math.floor(riverIndex / syntheticDimensions.width),
    });
    expect(FLOODPLAIN_INTENT_KEYS.has(intents?.[0]?.feature ?? "")).toBe(true);
    expect(substrate.floodplainMask[riverIndex]).toBe(1);
  });
});
