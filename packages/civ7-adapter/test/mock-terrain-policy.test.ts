import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "../src/mock-adapter.js";

const TERRAIN_FLAT = 2;
const TERRAIN_COAST = 3;
const TERRAIN_OCEAN = 4;

describe("mock adapter terrain policy", () => {
  it("tracks stamped lakes separately from ordinary coast terrain", () => {
    const adapter = createMockAdapter({ width: 5, height: 3, defaultTerrainType: TERRAIN_OCEAN });

    adapter.setTerrainType(0, 1, TERRAIN_FLAT);
    adapter.storeWaterData();
    adapter.expandCoasts(5, 3);

    expect(adapter.getTerrainType(1, 1)).toBe(TERRAIN_COAST);
    expect(adapter.isWater(1, 1)).toBe(true);
    expect(adapter.isLake(1, 1)).toBe(false);

    const lakeMask = new Uint8Array(15);
    lakeMask[2 + 1 * 5] = 1;

    const projection = adapter.stampLakes(5, 3, lakeMask);

    expect(adapter.getTerrainType(2, 1)).toBe(TERRAIN_COAST);
    expect(adapter.isWater(2, 1)).toBe(true);
    expect(adapter.isLake(2, 1)).toBe(true);
    expect(adapter.isLake(1, 1)).toBe(false);
    expect(projection.engineLakeMask[2 + 1 * 5]).toBe(1);
    expect(projection.engineLakeMask[1 + 1 * 5]).toBe(0);
    expect(projection.nonLakeTileCount).toBe(0);
  });
});
