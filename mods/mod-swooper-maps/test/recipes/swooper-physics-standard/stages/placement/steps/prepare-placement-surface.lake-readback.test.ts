import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { captureEngineTerrainClassification } from "../../../../../../src/recipes/standard/current-engine-surface.js";
import { readFinalLakeProjection } from "../../../../../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/lake-readback.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

describe("placement final lake readback", () => {
  it("counts accepted lake tiles that placement-time maintenance dries or declassifies", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = new MockAdapter({
      width,
      height,
      rng: createLabelRng(TEST_MAP_SEED),
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
    });
    const coastTerrain = adapter.getTerrainTypeIndex("TERRAIN_COAST");
    const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
      }
    }
    const acceptedLakeMask = new Uint8Array(width * height);
    acceptedLakeMask[1 + width] = 1;
    acceptedLakeMask[2 + width] = 1;

    // This reproduces the lifecycle problem we care about: map-hydrology accepted
    // both lakes, but later engine maintenance left one tile as non-lake water
    // and another as dry land at the final placement surface boundary.
    adapter.setTerrainType(1, 1, coastTerrain);
    adapter.setTerrainType(2, 1, flatTerrain);

    const currentSurface = captureEngineTerrainClassification(
      { width, height },
      {
        getTerrainType: (x, y) => adapter.getTerrainType(x, y),
        isWater: (x, y) => adapter.isWater(x, y),
        isLake: (x, y) => adapter.isLake(x, y),
      }
    );
    expect(readFinalLakeProjection(currentSurface, acceptedLakeMask)).toEqual({
      acceptedLakeTileCount: 2,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 2,
    });
  });

  it("counts a projection-accepted lake lost before placement without counting rejected intent", () => {
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

    const acceptedTile = 1 + width;
    const dryRejectedTile = 2 + width;
    const plannedLakeMask = new Uint8Array(width * height);
    plannedLakeMask[acceptedTile] = 1;
    plannedLakeMask[dryRejectedTile] = 1;

    // Projection publishes only the exact accepted mask. The accepted tile is
    // already dry by the time placement observes Civ7; the rejected planned
    // tile is equally dry but must never contribute to continuity drift.
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[acceptedTile] = 1;
    const finalSurface = captureEngineTerrainClassification(
      { width, height },
      {
        getTerrainType: (x, y) => adapter.getTerrainType(x, y),
        isWater: (x, y) => adapter.isWater(x, y),
        isLake: (x, y) => adapter.isLake(x, y),
      }
    );

    expect(projectedLakeMask[acceptedTile]).toBe(1);
    expect(plannedLakeMask[dryRejectedTile]).toBe(1);
    expect(projectedLakeMask[dryRejectedTile]).toBe(0);
    expect(readFinalLakeProjection(finalSurface, projectedLakeMask)).toEqual({
      acceptedLakeTileCount: 1,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 1,
    });
  });
});
