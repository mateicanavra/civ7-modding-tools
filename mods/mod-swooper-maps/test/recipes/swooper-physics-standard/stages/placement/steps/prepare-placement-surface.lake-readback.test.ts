import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { readFinalLakeProjection } from "../../../../../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/lake-readback.js";
import { TEST_MAP_SIZE } from "../../../../../map-size.js";

describe("placement final lake readback", () => {
  it("counts accepted lake tiles that placement-time maintenance dries or declassifies", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = new MockAdapter({
      width,
      height,
      rng: createLabelRng(1234),
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

    expect(readFinalLakeProjection(adapter, width, height, acceptedLakeMask)).toEqual({
      acceptedLakeTileCount: 2,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 2,
    });
  });
});
