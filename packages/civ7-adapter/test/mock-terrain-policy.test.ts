import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "../src/mock-adapter.js";

const TERRAIN_MOUNTAIN = 0;
const TERRAIN_FLAT = 2;
const TERRAIN_COAST = 3;
const TERRAIN_OCEAN = 4;

describe("mock adapter terrain policy", () => {
  it("does not expand coast solely from land adjacency during terrain validation", () => {
    const adapter = createMockAdapter({
      width: 16,
      height: 3,
      defaultTerrainType: TERRAIN_OCEAN,
      rng: () => 0,
    });

    adapter.setTerrainType(4, 1, TERRAIN_FLAT);
    adapter.storeWaterData();

    adapter.validateAndFixTerrain();

    expect(adapter.getTerrainType(5, 1)).toBe(TERRAIN_OCEAN);
    expect(adapter.isWater(5, 1)).toBe(true);
    expect(adapter.isLake(5, 1)).toBe(false);
  });

  it("materializes coast for ocean touching both land and existing coast during terrain validation", () => {
    const adapter = createMockAdapter({
      width: 16,
      height: 3,
      defaultTerrainType: TERRAIN_OCEAN,
      rng: () => 1,
    });

    adapter.setTerrainType(4, 1, TERRAIN_FLAT);
    adapter.setTerrainType(5, 0, TERRAIN_COAST);
    adapter.storeWaterData();

    adapter.validateAndFixTerrain();

    expect(adapter.getTerrainType(5, 1)).toBe(TERRAIN_COAST);
    expect(adapter.isWater(5, 1)).toBe(true);
    expect(adapter.isLake(5, 1)).toBe(false);
  });

  it("does not use validation-materialized coast as a seed on later validation passes", () => {
    const adapter = createMockAdapter({
      width: 16,
      height: 4,
      defaultTerrainType: TERRAIN_OCEAN,
      rng: () => 1,
    });

    adapter.setTerrainType(5, 0, TERRAIN_COAST);
    adapter.setTerrainType(4, 2, TERRAIN_FLAT);
    adapter.storeWaterData();

    adapter.validateAndFixTerrain();
    adapter.validateAndFixTerrain();

    expect(adapter.getTerrainType(5, 1)).toBe(TERRAIN_COAST);
    expect(adapter.getTerrainType(5, 2)).toBe(TERRAIN_OCEAN);
  });

  it("expands ocean next to existing coast when shallow-water scatter accepts it", () => {
    const adapter = createMockAdapter({
      width: 16,
      height: 3,
      defaultTerrainType: TERRAIN_OCEAN,
      rng: () => 0,
    });

    adapter.setTerrainType(4, 1, TERRAIN_COAST);
    adapter.storeWaterData();

    adapter.expandCoasts(16, 3);

    expect(adapter.getTerrainType(5, 1)).toBe(TERRAIN_COAST);
    expect(adapter.isWater(5, 1)).toBe(true);
    expect(adapter.isLake(5, 1)).toBe(false);
  });

  it("keeps adjacent ocean unchanged when shallow-water scatter rejects it", () => {
    const adapter = createMockAdapter({
      width: 16,
      height: 3,
      defaultTerrainType: TERRAIN_OCEAN,
      rng: () => 1,
    });

    adapter.setTerrainType(4, 1, TERRAIN_COAST);
    adapter.storeWaterData();

    adapter.expandCoasts(16, 3);

    expect(adapter.getTerrainType(5, 1)).toBe(TERRAIN_OCEAN);
  });

  it("does not treat mountain or land terrain as a coast expansion seed", () => {
    const adapter = createMockAdapter({
      width: 16,
      height: 3,
      defaultTerrainType: TERRAIN_OCEAN,
      rng: () => 0,
    });

    adapter.setTerrainType(4, 1, TERRAIN_MOUNTAIN);
    adapter.setTerrainType(4, 2, TERRAIN_FLAT);
    adapter.storeWaterData();

    adapter.validateAndFixTerrain();

    expect(adapter.getTerrainType(5, 1)).toBe(TERRAIN_OCEAN);
  });

  it("tracks stamped lakes separately from ordinary coast terrain", () => {
    const adapter = createMockAdapter({ width: 5, height: 3, defaultTerrainType: TERRAIN_OCEAN });

    adapter.setTerrainType(1, 1, TERRAIN_COAST);
    adapter.storeWaterData();

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
