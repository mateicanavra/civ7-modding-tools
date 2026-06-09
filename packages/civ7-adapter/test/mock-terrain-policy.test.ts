import { describe, expect, it } from "bun:test";

import { NO_RIVER_TYPE, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
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

  it("reads navigable river projection parity without claiming minor river stamping", () => {
    const adapter = createMockAdapter({ width: 5, height: 2, defaultTerrainType: TERRAIN_FLAT });
    const navigableRiverTerrain = adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    const planned = new Uint8Array(10);
    planned[1] = 1;
    planned[2] = 1;
    planned[3] = 1;

    adapter.setTerrainType(1, 0, navigableRiverTerrain);
    adapter.setTerrainType(2, 0, navigableRiverTerrain);
    adapter.setTerrainType(4, 0, navigableRiverTerrain);
    (adapter as unknown as { riverTypes: Int8Array }).riverTypes[3] = RIVER_TYPE_NAVIGABLE;
    (adapter as unknown as { riverMask: Uint8Array }).riverMask[3] = 1;

    const projection = adapter.readRiverProjection(5, 2, planned);

    expect(adapter.getRiverType(0, 0)).toBe(NO_RIVER_TYPE);
    expect(adapter.isRiver(0, 0)).toBe(false);
    expect(adapter.getRiverType(1, 0)).toBe(NO_RIVER_TYPE);
    expect(adapter.isRiver(1, 0)).toBe(false);
    expect(adapter.isNavigableRiver(1, 0)).toBe(false);
    expect(adapter.isAdjacentToRivers(1, 1)).toBe(false);
    expect(adapter.isAdjacentToRivers(3, 1)).toBe(true);
    expect(projection.stampedNavigableRiverTileCount).toBe(2);
    expect(projection.rejectedNavigableRiverTileCount).toBe(1);
    expect(projection.extraNavigableRiverTileCount).toBe(1);
    expect(projection.navigableRiverMismatchTileCount).toBe(2);
    expect(projection.engineRiverType[0]).toBe(NO_RIVER_TYPE);
    expect(projection.engineRiverType[1]).toBe(NO_RIVER_TYPE);
    expect(projection.engineNavigableRiverMask[1]).toBe(0);
    expect(projection.engineNavigableRiverMask[3]).toBe(1);
    expect(projection.terrainNavigableRiverMask[3]).toBe(0);
    expect(projection.rejectedNavigableRiverMask[3]).toBe(1);
    expect(projection.engineRiverTileCount).toBe(1);
    expect(projection.engineNavigableRiverTileCount).toBe(1);
    expect(projection.terrainNavigableRiverTileCount).toBe(3);
    expect(projection.engineMinorRiverTileCount).toBe(0);
    expect(projection.minorRiverStampingSupported).toBe(false);
  });
});
