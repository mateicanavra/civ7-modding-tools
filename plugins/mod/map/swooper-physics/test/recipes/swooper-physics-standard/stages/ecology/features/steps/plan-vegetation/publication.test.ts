import { createEmptyWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";
import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../../../src/domain/ecology/index.js";
import { artifacts as biomeArtifacts } from "../../../../../../../../src/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
import { artifacts as climateArtifacts } from "../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanVegetationStep as planVegetationStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.js";
import {
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../../../../../setup.js";
import { createEmptyFeatureScoreLayers } from "../../fixtures/feature-score-layers.js";

describe("ecology-features plan-vegetation step", () => {
  it.each([
    {
      name: "publishes terminal forest intent from admitted feature suitability",
      forestScore01: 1,
      zeroFloor: false,
      upstreamOccupancy: false,
    },
    {
      name: "publishes empty vegetation intent for zero score layers at authored zero floors",
      forestScore01: 0,
      zeroFloor: true,
      upstreamOccupancy: false,
    },
    {
      name: "preserves upstream occupancy when publishing positive vegetation at zero floors",
      forestScore01: 1,
      zeroFloor: true,
      upstreamOccupancy: true,
    },
  ])("$name", ({ forestScore01, zeroFloor, upstreamOccupancy }) => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
    });
    adapter.fillWater(false);

    const ctx = createMapContext({ setup, adapter });
    const wetlandIntents = upstreamOccupancy
      ? [{ x: 0, y: 0, feature: "marsh" as const }]
      : [];

    withMapContextExecutionForTest(ctx, (stepContext) => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.forest.fill(forestScore01);

      publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.iceIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.reefIntents, []);
      publishTestArtifact(stepContext, featureArtifacts.wetlandIntents, wetlandIntents);
      publishTestArtifact(stepContext, biomeArtifacts.biomeClassification, {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
        vegetationDensity: new Float32Array(size).fill(0.4),
        treeLine01: new Float32Array(size),
      });
      publishTestArtifact(stepContext, climateArtifacts.climateIndices, {
        effectiveMoisture: new Float32Array(size).fill(120),
        surfaceTemperatureC: new Float32Array(size).fill(20),
        aridityIndex: new Float32Array(size).fill(0.4),
        freezeIndex: new Float32Array(size),
        pet: new Float32Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, createEmptyWaterFixture(width, height).hydrography);
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, createEmptyWaterFixture(width, height).lakePlan);
      publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        externalWaterMask: new Uint8Array(size),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.mountains, {
        mountainMask: new Uint8Array(size),
        mountainRegionMask: new Uint8Array(size),
        mountainRegionIdByTile: new Int32Array(size).fill(-1),
        hillMask: new Uint8Array(size),
        foothillMask: new Uint8Array(size),
        roughLandMask: new Uint8Array(size),
        orogenyPotential: new Uint8Array(size),
        fracturePotential: new Uint8Array(size),
        roughnessPotential: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.volcanoes, {
        volcanoMask: new Uint8Array(size),
        volcanoes: [],
      });

      const config = {
        planVegetation: normalizeOperationSelectionForTest(
          ecology.features.ops.planVegetation,
          zeroFloor
            ? {
                ...ecology.features.ops.planVegetation.defaultConfig,
                config: {
                  ...ecology.features.ops.planVegetation.defaultConfig.config,
                  forestMinConfidence01: 0,
                  rainforestMinConfidence01: 0,
                  taigaMinConfidence01: 0,
                  savannaWoodlandMinConfidence01: 0,
                  sagebrushSteppeMinConfidence01: 0,
                },
              }
            : ecology.features.ops.planVegetation.defaultConfig
        ),
      };
      const ops = ecology.features.ops.bind(planVegetationStep.contract.ops!);
      planVegetationStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(planVegetationStep, stepContext)
      );
    });

    const intents = readArtifact(ctx, featureArtifacts.vegetationIntents);
    if (forestScore01 === 0) {
      expect(intents).toEqual([]);
    } else {
      expect(intents.length).toBe(size - wetlandIntents.length);
      expect(intents[0]).toEqual({ x: upstreamOccupancy ? 1 : 0, y: 0, feature: "forest" });
      expect(intents.at(-1)).toEqual({ x: width - 1, y: height - 1, feature: "forest" });
    }
    expect(intents.every(({ feature }) => feature === "forest")).toBe(true);
    expect(readArtifact(ctx, featureArtifacts.wetlandIntents)).toEqual(wetlandIntents);
  });
});
