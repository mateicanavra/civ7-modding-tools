import { createEmptyWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";
import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../../../src/domain/ecology/index.js";
import { artifacts as biomeArtifacts } from "../../../../../../../../src/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
import { artifacts as climateArtifacts } from "../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
} from "../../../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
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
        plantEffectiveMoisture: new Float32Array(size).fill(120),
        surfaceTemperatureC: new Float32Array(size).fill(20),
        aridityIndex: new Float32Array(size).fill(0.4),
        plantWaterStress: new Float32Array(size).fill(0.4),
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

  it.each([
    { feature: "forest", biome: BIOME_SYMBOL_TO_INDEX.temperateHumid, temperature: 20 },
    { feature: "rainforest", biome: BIOME_SYMBOL_TO_INDEX.tropicalRainforest, temperature: 25 },
    { feature: "taiga", biome: BIOME_SYMBOL_TO_INDEX.boreal, temperature: 2 },
    { feature: "savanna-woodland", biome: BIOME_SYMBOL_TO_INDEX.tropicalSeasonal, temperature: 20 },
    { feature: "sagebrush-steppe", biome: BIOME_SYMBOL_TO_INDEX.desert, temperature: 20 },
  ] as const)(
    "publishes $feature on flat none/minor-river land while preserving exclusions",
    ({ feature, biome, temperature }) => {
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
      const candidates = {
        none: 0,
        minor: 1,
        major: 2,
        submerged: 3,
        mountain: 4,
        hill: 5,
        volcano: 6,
        floodplain: 7,
        ice: 8,
        reef: 9,
        wetland: 10,
        zeroScore: 11,
        belowFloor: 12,
        invalidHabitat: 13,
      };
      const floodplainIntents = [
        { x: candidates.floodplain, y: 0, feature: "grassland-floodplain-minor" as const },
      ];
      const iceIntents = [{ x: candidates.ice, y: 0, feature: "ice" as const }];
      const reefIntents = [{ x: candidates.reef, y: 0, feature: "reef" as const }];
      const wetlandIntents = [{ x: candidates.wetland, y: 0, feature: "marsh" as const }];

      withMapContextExecutionForTest(ctx, (stepContext) => {
        const layers = createEmptyFeatureScoreLayers(size);
        const lakeMask = new Uint8Array(size);
        lakeMask[candidates.submerged] = 1;
        const water = createEmptyWaterFixture(width, height, lakeMask);
        for (const cell of Object.values(candidates)) {
          layers[feature][cell] = 1;
          water.hydrography.riverClass[cell] = RIVER_CLASS_MINOR;
          water.hydrography.flowDir[cell] = cell + 1;
        }
        layers[feature][candidates.zeroScore] = 0;
        layers[feature][candidates.belowFloor] = 0.01;
        water.hydrography.riverClass[candidates.none] = RIVER_CLASS_NONE;
        water.hydrography.riverClass[candidates.submerged] = RIVER_CLASS_NONE;
        water.hydrography.riverClass[candidates.major] = RIVER_CLASS_MAJOR;
        const biomeIndex = new Uint8Array(size).fill(biome);
        biomeIndex[candidates.invalidHabitat] =
          biome === BIOME_SYMBOL_TO_INDEX.tropicalRainforest
            ? BIOME_SYMBOL_TO_INDEX.temperateHumid
            : BIOME_SYMBOL_TO_INDEX.tropicalRainforest;
        const mountainMask = new Uint8Array(size);
        mountainMask[candidates.mountain] = 1;
        const hillMask = new Uint8Array(size);
        hillMask[candidates.hill] = 1;
        const volcanoMask = new Uint8Array(size);
        volcanoMask[candidates.volcano] = 1;

        publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
          width,
          height,
          layers,
        });
        publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, floodplainIntents);
        publishTestArtifact(stepContext, featureArtifacts.iceIntents, iceIntents);
        publishTestArtifact(stepContext, featureArtifacts.reefIntents, reefIntents);
        publishTestArtifact(stepContext, featureArtifacts.wetlandIntents, wetlandIntents);
        publishTestArtifact(stepContext, biomeArtifacts.biomeClassification, {
          width,
          height,
          biomeIndex,
          vegetationDensity: new Float32Array(size).fill(0.4),
          treeLine01: new Float32Array(size),
        });
        publishTestArtifact(stepContext, climateArtifacts.climateIndices, {
          effectiveMoisture: new Float32Array(size).fill(120),
          plantEffectiveMoisture: new Float32Array(size).fill(120),
          surfaceTemperatureC: new Float32Array(size).fill(temperature),
          aridityIndex: new Float32Array(size).fill(0.4),
          plantWaterStress: new Float32Array(size).fill(0.4),
          freezeIndex: new Float32Array(size),
          pet: new Float32Array(size),
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, water.hydrography);
        publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, water.lakePlan);
        publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, {
          elevation: new Int16Array(size),
          seaLevel: 0,
          landMask: new Uint8Array(size).fill(1),
          externalWaterMask: new Uint8Array(size),
          bathymetry: new Int16Array(size),
        });
        publishTestArtifact(stepContext, morphologyLandformsArtifacts.mountains, {
          mountainMask,
          mountainRegionMask: new Uint8Array(size),
          mountainRegionIdByTile: new Int32Array(size).fill(-1),
          hillMask,
          foothillMask: new Uint8Array(size),
          roughLandMask: new Uint8Array(size),
          orogenyPotential: new Uint8Array(size),
          fracturePotential: new Uint8Array(size),
          roughnessPotential: new Uint8Array(size),
        });
        publishTestArtifact(stepContext, morphologyLandformsArtifacts.volcanoes, {
          volcanoMask,
          volcanoes: [{ tileIndex: candidates.volcano, kind: "intraplate", strength01: 1 }],
        });

        const config = {
          planVegetation: normalizeOperationSelectionForTest(
            ecology.features.ops.planVegetation,
            ecology.features.ops.planVegetation.defaultConfig
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

      expect(readArtifact(ctx, featureArtifacts.vegetationIntents)).toEqual([
        { x: candidates.none, y: 0, feature },
        { x: candidates.minor, y: 0, feature },
      ]);
      expect(readArtifact(ctx, featureArtifacts.floodplainIntents)).toEqual(floodplainIntents);
      expect(readArtifact(ctx, featureArtifacts.iceIntents)).toEqual(iceIntents);
      expect(readArtifact(ctx, featureArtifacts.reefIntents)).toEqual(reefIntents);
      expect(readArtifact(ctx, featureArtifacts.wetlandIntents)).toEqual(wetlandIntents);
    }
  );
});
