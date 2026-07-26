import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "../src/mock-adapter.js";

describe("MockAdapter", () => {
  it("uses the default map dimensions", () => {
    const adapter = createMockAdapter();

    expect(adapter.width).toBe(128);
    expect(adapter.height).toBe(80);
  });

  it("accepts custom map dimensions", () => {
    const adapter = createMockAdapter({ width: 64, height: 40 });

    expect(adapter.width).toBe(64);
    expect(adapter.height).toBe(40);
  });

  it("stores water and terrain state", () => {
    const adapter = createMockAdapter({ width: 10, height: 10 });

    expect(adapter.isWater(5, 5)).toBe(false);
    expect(adapter.getTerrainType(5, 5)).toBe(0);

    adapter.setWater(5, 5, true);
    expect(adapter.isWater(5, 5)).toBe(true);

    adapter.setTerrainType(5, 5, 3);
    expect(adapter.getTerrainType(5, 5)).toBe(3);
  });

  it("returns detached current-map layers with full-width engine ids and fresh post-mutation state", () => {
    const adapter = createMockAdapter({
      width: 2,
      height: 1,
      defaultTerrainType: 700,
      defaultBiomeType: 900,
    });
    adapter.setFeatureType(0, 0, { Feature: 40_000, Direction: -1, Elevation: 0 });
    adapter.setWater(1, 0, true);

    const before = adapter.readCurrentMapSurface();
    expect(before.terrainType).toBeInstanceOf(Int32Array);
    expect(before.biomeType).toBeInstanceOf(Int32Array);
    expect(before.featureType).toBeInstanceOf(Int32Array);
    expect(before.riverType).toBeInstanceOf(Int32Array);
    expect(Array.from(before.terrainType)).toEqual([700, 700]);
    expect(Array.from(before.biomeType)).toEqual([900, 900]);
    expect(Array.from(before.featureType)).toEqual([40_000, -1]);
    expect(Array.from(before.waterMask)).toEqual([0, 1]);

    before.terrainType[0] = 1;
    before.featureType[0] = 2;
    expect(adapter.getTerrainType(0, 0)).toBe(700);
    expect(adapter.getFeatureType(0, 0)).toBe(40_000);

    adapter.setTerrainType(0, 0, 701);
    adapter.setFeatureType(0, 0, { Feature: 40_001, Direction: -1, Elevation: 0 });
    const after = adapter.readCurrentMapSurface();
    expect(after).not.toBe(before);
    expect(after.terrainType[0]).toBe(701);
    expect(after.featureType[0]).toBe(40_001);
    expect(before.terrainType[0]).toBe(1);
    expect(before.featureType[0]).toBe(2);
  });

  it("clears river metadata when reset returns the mock to a fresh map", () => {
    const adapter = createMockAdapter({ width: 2, height: 1 });
    const navigableTerrain = adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    adapter.setTerrainType(0, 0, navigableTerrain);
    adapter.modelRivers(0, 0, navigableTerrain);

    expect(Array.from(adapter.readCurrentMapSurface().riverMask)).toEqual([1, 0]);

    adapter.reset();

    const resetSurface = adapter.readCurrentMapSurface();
    expect(Array.from(resetSurface.riverMask)).toEqual([0, 0]);
    expect(Array.from(resetSurface.navigableRiverMask)).toEqual([0, 0]);
    expect(Array.from(resetSurface.minorRiverMask)).toEqual([0, 0]);
  });
});
