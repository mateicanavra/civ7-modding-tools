import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as featureArtifacts } from "@mapgen/domain/ecology/modules/features/artifacts/index.js";
import ecology from "@mapgen/domain/ecology/router";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlanWetlandsStep as planWetlandsStep } from "../../../../../../../src/recipes/standard/stages/ecology/features/steps/plan-wetlands/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";
import { createEmptyFeatureScoreLayers } from "../fixtures/feature-score-layers.js";

describe("ecology-features plan-wetlands step", () => {
  it("publishes wetland intents and occupancy snapshot", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
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
      mapSizeId: TEST_MAP_SIZE.id,
    });
    adapter.fillWater(false);

    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, (stepContext) => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.marsh.fill(1);

      publishTestArtifact(stepContext, biomeArtifacts.biomeClassification, {
        width,
        height,
        biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
        vegetationDensity: new Float32Array(size).fill(0.4),
        treeLine01: new Float32Array(size),
      });
      publishTestArtifact(stepContext, featureArtifacts.scoreLayers, {
        width,
        height,
        layers,
      });
      publishTestArtifact(stepContext, featureArtifacts.occupancyReefs, {
        width,
        height,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
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
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, {
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
        planWetlands: normalizeOperationSelectionForTest(
          ecology.features.ops.planWetlands,
          ecology.features.ops.planWetlands.defaultConfig
        ),
      };
      const ops = ecology.features.ops.bind(planWetlandsStep.contract.ops!).runtime;
      planWetlandsStep.run(stepContext, config, ops, buildStepTestDependencies(planWetlandsStep));
    });

    const intents = readValidatedArtifact(ctx, featureArtifacts.featureIntentsWetlands);
    expect(Array.isArray(intents)).toBe(true);
    expect(intents.length).toBeGreaterThan(0);

    const occupancy = readValidatedArtifact(ctx, featureArtifacts.occupancyWetlands);
    expect(occupancy.width).toBe(width);
    expect(occupancy.height).toBe(height);
    expect(occupancy.featureOccupancyMask instanceof Uint8Array).toBe(true);
    expect(occupancy.reserved instanceof Uint8Array).toBe(true);
  });
});
