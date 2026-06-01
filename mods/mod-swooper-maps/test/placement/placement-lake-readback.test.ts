import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { readFinalLakeProjection } from "../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/lake-readback.js";

describe("placement final lake readback", () => {
  it("counts accepted lake tiles that placement-time maintenance dries or declassifies", () => {
    const width = 4;
    const height = 3;
    const adapter = new MockAdapter({
      width,
      height,
      rng: createLabelRng(1234),
      defaultTerrainType: FLAT_TERRAIN,
      mapInfo: { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 },
      mapSizeId: 1,
    });
    const acceptedLakeMask = new Uint8Array(width * height);
    acceptedLakeMask[1 + width] = 1;
    acceptedLakeMask[2 + width] = 1;

    // This reproduces the lifecycle problem we care about: map-hydrology accepted
    // both lakes, but a later engine maintenance pass left one tile no longer
    // reading as lake water at the final placement surface boundary.
    adapter.setTerrainType(1, 1, COAST_TERRAIN);
    adapter.setTerrainType(2, 1, FLAT_TERRAIN);

    expect(readFinalLakeProjection(adapter, width, height, acceptedLakeMask)).toEqual({
      acceptedLakeTileCount: 2,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 1,
    });
  });
});
