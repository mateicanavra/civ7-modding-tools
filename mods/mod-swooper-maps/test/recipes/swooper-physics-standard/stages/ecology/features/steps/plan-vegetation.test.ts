import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanVegetationStep as planVegetationStep } from "../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.js";
import { TEST_MAP_SIZE } from "../../../../../../map-size.js";
import { createEmptyFeatureScoreLayers } from "../fixtures/feature-score-layers.js";

describe("ecology-features plan-vegetation step", () => {
  it("publishes terminal vegetation intent", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 123,
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
      mapSizeId: TEST_MAP_SIZE.id,
    });
    adapter.fillWater(false);

    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, (stepContext) => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.forest.fill(1);

      publishTestArtifact(stepContext, ecologyArtifacts.scoreLayers, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, ecologyArtifacts.occupancyWetlands, {
        width,
        height,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, ecologyArtifacts.biomeClassification, {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
        vegetationDensity: new Float32Array(size).fill(0.4),
        treeLine01: new Float32Array(size),
      });
      publishTestArtifact(stepContext, hydrologyArtifacts.climateIndices, {
        effectiveMoisture: new Float32Array(size).fill(120),
        surfaceTemperatureC: new Float32Array(size).fill(20),
        aridityIndex: new Float32Array(size).fill(0.4),
        freezeIndex: new Float32Array(size),
        pet: new Float32Array(size),
      });
      publishTestArtifact(stepContext, hydrologyArtifacts.hydrography, {
        runoff: new Float32Array(size),
        discharge: new Float32Array(size),
        riverClass: new Uint8Array(size),
        flowDir: new Int32Array(size).fill(-1),
        sinkMask: new Uint8Array(size),
        outletMask: new Uint8Array(size),
        basinId: new Int32Array(size).fill(-1),
        routingElevation: new Float32Array(size),
        depressionDepth: new Float32Array(size),
        terminalType: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, hydrologyArtifacts.lakePlan, {
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
      });
      publishTestArtifact(stepContext, morphologyArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyArtifacts.mountains, {
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
      publishTestArtifact(stepContext, morphologyArtifacts.volcanoes, {
        volcanoMask: new Uint8Array(size),
        volcanoes: [],
      });

      const config = {
        planVegetation: normalizeOperationSelectionForTest(
          ecology.ops.planVegetation,
          ecology.ops.planVegetation.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(planVegetationStep.contract.ops!).runtime;
      planVegetationStep.run(
        stepContext,
        config,
        ops,
        buildStepTestDependencies(planVegetationStep)
      );
    });

    const intents = readValidatedArtifact(ctx, ecologyArtifacts.featureIntentsVegetation);
    expect(Array.isArray(intents)).toBe(true);
    expect(intents.length).toBeGreaterThan(0);
  });
});
