import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { PreparePlacementSurfaceStep } from "../../../../../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

function executePreparation(adapter: MockAdapter, acceptedLakeMask: Uint8Array) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: {
        topLatitude: TEST_MAP_SIZE.mapInfo.MaxLatitude!,
        bottomLatitude: TEST_MAP_SIZE.mapInfo.MinLatitude!,
      },
    }),
    adapter,
  });
  return withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, {
      lakeMask: acceptedLakeMask,
    });
    publishTestArtifact(stepContext, placementRegionArtifacts.landmassRegionSlotByTile, {
      slotByTile: new Uint8Array(size),
    });
    publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, {
      shelfMask: new Uint8Array(size),
      coastalLand: new Uint8Array(size),
      coastalWater: new Uint8Array(size),
      distanceToCoast: new Uint16Array(size),
    });
    publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask: new Uint8Array(size).fill(1),
      bathymetry: new Int16Array(size),
    });
    const result = PreparePlacementSurfaceStep.run(
      stepContext,
      {},
      {},
      buildStepTestDependencies(PreparePlacementSurfaceStep, stepContext)
    );
    if (result instanceof Promise) {
      throw new Error("The placement surface preparation step must remain synchronous.");
    }
    return result;
  });
}

function createLandAdapter(): MockAdapter {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const adapter = new MockAdapter({
    width,
    height,
    rng: createLabelRng(TEST_MAP_SEED),
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
  });
  const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      adapter.setTerrainType(x, y, flatTerrain);
    }
  }
  return adapter;
}

describe("placement final lake readback", () => {
  it("counts accepted lake tiles that placement-time maintenance dries or declassifies", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const acceptedLakeMask = new Uint8Array(width * height);
    acceptedLakeMask[1 + width] = 1;
    acceptedLakeMask[2 + width] = 1;
    adapter.setTerrainType(1, 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));

    expect(executePreparation(adapter, acceptedLakeMask).finalLakeReadback).toEqual({
      acceptedLakeTileCount: 2,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 2,
    });
  });

  it("ignores rejected lake intent when measuring accepted projection continuity", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const acceptedTile = 1 + width;
    const rejectedTile = 2 + width;
    const plannedLakeMask = new Uint8Array(width * height);
    plannedLakeMask[acceptedTile] = 1;
    plannedLakeMask[rejectedTile] = 1;
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[acceptedTile] = 1;

    expect(plannedLakeMask[rejectedTile]).toBe(1);
    expect(projectedLakeMask[rejectedTile]).toBe(0);
    expect(executePreparation(adapter, projectedLakeMask).finalLakeReadback).toEqual({
      acceptedLakeTileCount: 1,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 1,
    });
  });
});
