import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as biomeArtifacts } from "../../../../../../../../src/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "../../../../../../../../src/domain/ecology/modules/features/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "../../../../../../../../src/domain/ecology/modules/pedology/artifacts/index.js";
import ecology from "../../../../../../../../src/domain/ecology/router.js";
import { artifacts as climateArtifacts } from "../../../../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as landformsArtifacts } from "../../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as shelfArtifacts } from "../../../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { ScoreLayersStep } from "../../../../../../../../src/recipes/standard/stages/ecology/features/steps/score-layers/step.js";
import { TEST_MAP_SEED } from "../../../../../../../setup.js";
import { createSurfaceWaterFixture } from "../../../../morphology/features/fixtures/surface-water.js";

const features = ecology.features.ops;
const config = {
  vegetationSubstrate: features.computeVegetationSubstrate.defaultConfig,
  featureSubstrate: features.computeFeatureSubstrate.defaultConfig,
  scoreForest: features.scoreVegetationForest.defaultConfig,
  scoreRainforest: features.scoreVegetationRainforest.defaultConfig,
  scoreTaiga: features.scoreVegetationTaiga.defaultConfig,
  scoreSavannaWoodland: features.scoreVegetationSavannaWoodland.defaultConfig,
  scoreSagebrushSteppe: features.scoreVegetationSagebrushSteppe.defaultConfig,
  scoreWetMarsh: features.scoreWetMarsh.defaultConfig,
  scoreWetTundraBog: features.scoreWetTundraBog.defaultConfig,
  scoreWetMangrove: features.scoreWetMangrove.defaultConfig,
  scoreWetOasis: features.scoreWetOasis.defaultConfig,
  scoreWetWateringHole: features.scoreWetWateringHole.defaultConfig,
  scoreReef: features.scoreReef.defaultConfig,
  scoreColdReef: features.scoreColdReef.defaultConfig,
  scoreReefAtoll: features.scoreReefAtoll.defaultConfig,
  scoreReefLotus: features.scoreReefLotus.defaultConfig,
  scoreIce: features.scoreIce.defaultConfig,
  scoreFloodplains: features.scoreFloodplains.defaultConfig,
};

describe("ecology-features score-layers step", () => {
  it("publishes actual Lotus suitability from zero-copy physical water evidence", () => {
    const width = 8;
    const height = 1;
    const size = width * height;
    const fixture = createSurfaceWaterFixture(width, height);
    const { topography, lakePlan, hydrography, wetCell } = fixture;
    lakePlan.waterSurface[wetCell] = 800.25;
    for (const body of lakePlan.bodies) body.level = 800.25;
    for (const pool of lakePlan.pools) pool.level = 800.25;
    for (const component of lakePlan.components) component.level = 800.25;
    topography.bathymetry[0] = -10;
    const before = structuredClone(fixture);
    const surfaceTemperatureC = new Float32Array(size).fill(32);
    const shelfMask = new Uint8Array(size);
    const coastalWater = new Uint8Array(size);
    shelfMask[0] = coastalWater[0] = 1;
    const distanceToCoast = new Uint16Array(size).fill(65535);
    distanceToCoast[0] = 0;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });
    const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
    let lotusCalls = 0;

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, landformsArtifacts.topography, topography);
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, lakePlan);
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, hydrography);
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedRivers, {
        model: "certified-sill-spill", width, height,
        riverMask: new Uint8Array(size),
        nativeMinorRiverMask: new Uint8Array(size),
        plannedMinorRiverMask: new Uint8Array(size),
        plannedMajorRiverMask: new Uint8Array(size),
        plannedMinorRiverTileCount: 0, plannedMajorRiverTileCount: 0,
        authoredSourceCount: 0, writes: [], wetTransitionWrites: [], wetTransitionDispositions: [],
      });
      publishTestArtifact(stepContext, biomeArtifacts.biomeClassification, {
        width, height,
        biomeIndex: new Uint8Array(size),
        vegetationDensity: new Float32Array(size).fill(0.4),
        treeLine01: new Float32Array(size),
      });
      publishTestArtifact(stepContext, pedologyArtifacts.pedology, {
        width, height,
        soilType: new Uint8Array(size),
        fertility: new Float32Array(size).fill(0.5),
      });
      publishTestArtifact(stepContext, climateArtifacts.climateIndices, {
        effectiveMoisture: new Float32Array(size).fill(120),
        surfaceTemperatureC,
        aridityIndex: new Float32Array(size).fill(0.4),
        freezeIndex: new Float32Array(size),
        pet: new Float32Array(size),
      });
      publishTestArtifact(stepContext, shelfArtifacts.shelf, {
        shelfMask, coastalWater, distanceToCoast, coastalLand: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, landformsArtifacts.mountains, {
        mountainMask: new Uint8Array(size), mountainRegionMask: new Uint8Array(size),
        mountainRegionIdByTile: new Int32Array(size).fill(-1), hillMask: new Uint8Array(size),
        foothillMask: new Uint8Array(size), roughLandMask: new Uint8Array(size),
        orogenyPotential: new Uint8Array(size), fracturePotential: new Uint8Array(size),
        roughnessPotential: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, landformsArtifacts.volcanoes, {
        volcanoMask: new Uint8Array(size), volcanoes: [],
      });

      const ops = features.bind(ScoreLayersStep.contract.ops!);
      const scoreReefLotus: typeof ops.scoreReefLotus = (input, operationConfig) => {
        lotusCalls++;
        expect(input.landMask).toBe(topography.landMask);
        expect(input.lakeMask).toBe(lakePlan.lakeMask);
        expect(input.surfaceTemperature).toBe(surfaceTemperatureC);
        expect(input.landMask[wetCell]).toBe(1);
        expect(shelfMask[wetCell]).toBe(0);
        expect(coastalWater[wetCell]).toBe(0);
        expect(input.elevation).toBe(topography.elevation);
        expect(input.bodyId).toBe(lakePlan.bodyId);
        expect(input.waterSurface).toBe(lakePlan.waterSurface);
        expect(input.waterSurface[wetCell]).toBe(800.25);
        return ops.scoreReefLotus(input, operationConfig);
      };
      ScoreLayersStep.run(stepContext, config, { ...ops, scoreReefLotus },
        buildStepTestDependencies(ScoreLayersStep, stepContext));
    });

    const suitability = readArtifact(context, featureArtifacts.featureSuitability);
    expect(lotusCalls).toBe(1);
    expect(suitability.layers.lotus[wetCell]).toBe(
      Math.fround(1 - 0.25 / 40)
    );
    expect(suitability.layers.lotus.every((score, cell) => score === 0 || lakePlan.lakeMask[cell] === 1)).toBe(true);
    expect(suitability.layers.reef[0]).toBeGreaterThan(0);
    for (const feature of ["reef", "cold-reef", "atoll"] satisfies (keyof typeof suitability.layers)[]) {
      expect(suitability.layers[feature][wetCell]).toBe(0);
    }
    expect(fixture).toEqual(before);
  });
});
