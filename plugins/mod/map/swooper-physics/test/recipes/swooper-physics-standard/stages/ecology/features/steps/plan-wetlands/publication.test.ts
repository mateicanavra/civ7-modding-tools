import { createEmptyWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";
import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../../../src/domain/ecology/index.js";
import { artifacts as biomeArtifacts } from "../../../../../../../../src/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
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
import { PlanWetlandsStep as planWetlandsStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-wetlands/step.js";
import {
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../../../../../setup.js";
import { createEmptyFeatureScoreLayers } from "../../fixtures/feature-score-layers.js";

describe("ecology-features plan-wetlands step", () => {
  it.each([
    { feature: "marsh", biome: "temperateHumid" },
    { feature: "tundra-bog", biome: "boreal" },
    { feature: "mangrove", biome: "tropicalRainforest" },
    { feature: "oasis", biome: "desert" },
    { feature: "watering-hole", biome: "tropicalSeasonal" },
  ] as const)("publishes $feature on compatible flat none/minor-river land while preserving exclusions", ({ feature, biome }) => {
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

    withMapContextExecutionForTest(ctx, (stepContext) => {
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
      };
      const layers = createEmptyFeatureScoreLayers(size);
      const lakeMask = new Uint8Array(size);
      lakeMask[candidates.submerged] = 1;
      const water = createEmptyWaterFixture(width, height, lakeMask);
      for (const cell of Object.values(candidates)) {
        layers[feature][cell] = 1;
        water.hydrography.riverClass[cell] = RIVER_CLASS_MINOR;
        water.hydrography.flowDir[cell] = cell + 1;
      }
      water.hydrography.riverClass[candidates.none] = RIVER_CLASS_NONE;
      water.hydrography.riverClass[candidates.submerged] = RIVER_CLASS_NONE;
      water.hydrography.riverClass[candidates.major] = RIVER_CLASS_MAJOR;
      const mountainMask = new Uint8Array(size);
      mountainMask[candidates.mountain] = 1;
      const hillMask = new Uint8Array(size);
      hillMask[candidates.hill] = 1;
      const volcanoMask = new Uint8Array(size);
      volcanoMask[candidates.volcano] = 1;

      publishTestArtifact(stepContext, biomeArtifacts.biomeClassification, {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX[biome]),
        vegetationDensity: new Float32Array(size).fill(0.4),
        treeLine01: new Float32Array(size),
      });
      publishTestArtifact(stepContext, featureArtifacts.featureSuitability, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, featureArtifacts.floodplainIntents, [
        { x: candidates.floodplain, y: 0, feature: "grassland-floodplain-minor" },
      ]);
      publishTestArtifact(stepContext, featureArtifacts.iceIntents, [
        { x: candidates.ice, y: 0, feature: "ice" },
      ]);
      publishTestArtifact(stepContext, featureArtifacts.reefIntents, [
        { x: candidates.reef, y: 0, feature: "reef" },
      ]);
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
        planWetlands: normalizeOperationSelectionForTest(
          ecology.features.ops.planWetlands,
          ecology.features.ops.planWetlands.defaultConfig
        ),
      };
      const ops = ecology.features.ops.bind(planWetlandsStep.contract.ops!);
      planWetlandsStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(planWetlandsStep, stepContext)
      );
    });

    const intents = readArtifact(ctx, featureArtifacts.wetlandIntents);
    expect(intents).toEqual([
      { x: 0, y: 0, feature },
      { x: 1, y: 0, feature },
    ]);
  });
});
