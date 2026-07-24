import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlotCoastsStep } from "../../../../../../../src/recipes/standard/stages/map/morphology/steps/plot-coasts/step.js";
import { PlotContinentsStep } from "../../../../../../../src/recipes/standard/stages/map/morphology/steps/plot-continents/step.js";
import { TEST_MAP_SIZE } from "../../../../../../setup.js";

function shelfFixture(size: number, shelfMask: Uint8Array, coastalWater: Uint8Array) {
  return {
    shelfMask,
    coastalLand: new Uint8Array(size),
    coastalWater,
    distanceToCoast: new Uint16Array(size),
  };
}

describe("map-morphology/plot-coasts", () => {
  it("stamps coast from the shelf + shoreline ring; ring promotes only land-adjacent ocean (no distance band)", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const seed = 1234;
    const setup = admitMapSetup({
      mapSeed: seed,
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
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const {
      TERRAIN_COAST: coastTerrain,
      TERRAIN_FLAT: flatTerrain,
      TERRAIN_OCEAN: oceanTerrain,
    } = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;

    const size = width * height;
    // Land only at (0,0). Source coast = a shoreline-ring water tile (1,0) + a shelf tile (2,1).
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1; // (1,0)
    const shelfMask = new Uint8Array(size).fill(0);
    shelfMask[width + 2] = 1; // (2,1)

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(
        stepContext,
        morphologyShelfArtifacts.shelf,
        shelfFixture(size, shelfMask, coastalWater)
      );

      PlotCoastsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotCoastsStep, stepContext)
      );
    });

    // Land stays land; source coast (shoreline ring + shelf) becomes COAST.
    expect(adapter.getTerrainType(0, 0)).toBe(flatTerrain);
    expect(adapter.getTerrainType(1, 0)).toBe(coastTerrain); // coastalWater (1,0)
    expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain); // shelfMask (2,1)
    // The coast-ring guarantee promotes a land-adjacent ocean tile (0,1) to coast.
    expect(adapter.getTerrainType(0, 1)).toBe(coastTerrain);
    // But an ocean tile two tiles from land (2,0) is NOT promoted -- there is no distance band,
    // even though it neighbours coast tiles (1,0) and (2,1). This is the key regression guard.
    expect(adapter.getTerrainType(2, 0)).toBe(oceanTerrain);

    // expandCoasts is intentionally not invoked by this step.
    expect(adapter.calls.expandCoasts).toHaveLength(0);
  });

  it("restores shelf coast terrain after downstream terrain maintenance rewrites it", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const seed = 4321;
    const setup = admitMapSetup({
      mapSeed: seed,
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
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_COAST: coastTerrain, TERRAIN_OCEAN: oceanTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1;
    const shelfMask = new Uint8Array(size).fill(0);
    const shelfIndex = width + 2;
    shelfMask[shelfIndex] = 1;

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(
        stepContext,
        morphologyShelfArtifacts.shelf,
        shelfFixture(size, shelfMask, coastalWater)
      );

      PlotCoastsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotCoastsStep, stepContext)
      );
      expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain);

      const originalValidate = adapter.validateAndFixTerrain.bind(adapter);
      adapter.validateAndFixTerrain = () => {
        originalValidate();
        adapter.setTerrainType(2, 1, oceanTerrain);
      };

      PlotContinentsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotContinentsStep, stepContext)
      );
    });

    expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain);
  });
});
