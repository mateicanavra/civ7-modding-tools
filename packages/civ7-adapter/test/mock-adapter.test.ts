import { describe, expect, it } from "bun:test";
import { NO_RIVER_TYPE, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";

import { createMockAdapter, DEFAULT_PLOT_EFFECT_TYPES, MockAdapter } from "../src/mock-adapter.js";

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

  it("keeps generic plot-effect defaults free of product-specific registrations", () => {
    expect(DEFAULT_PLOT_EFFECT_TYPES).toEqual([
      {
        id: 0,
        name: "PLOTEFFECT_SNOW_LIGHT_PERMANENT",
        tags: ["SNOW", "LIGHT", "PERMANENT"],
      },
      {
        id: 1,
        name: "PLOTEFFECT_SNOW_MEDIUM_PERMANENT",
        tags: ["SNOW", "MEDIUM", "PERMANENT"],
      },
      {
        id: 2,
        name: "PLOTEFFECT_SNOW_HEAVY_PERMANENT",
        tags: ["SNOW", "HEAVY", "PERMANENT"],
      },
      { id: 3, name: "PLOTEFFECT_SAND", tags: ["SAND"] },
      { id: 4, name: "PLOTEFFECT_BURNED", tags: ["BURNED"] },
    ]);
    expect(Object.isFrozen(DEFAULT_PLOT_EFFECT_TYPES)).toBe(true);
    expect(DEFAULT_PLOT_EFFECT_TYPES.every(Object.isFrozen)).toBe(true);
  });

  it("preserves exact ordered alive-major identities", () => {
    const configured = [7, 2, 11];
    const adapter = createMockAdapter({ aliveMajorPlayerIds: configured });

    configured[0] = 0;
    expect(adapter.getAliveMajorIds()).toEqual([7, 2, 11]);
    expect(adapter.getAliveMajorIds()).not.toBe(adapter.getAliveMajorIds());
  });

  it("refuses ambiguous or invalid alive-major fixtures", () => {
    const sparse = Array<number>(1);
    const accessor = [7];
    Object.defineProperty(accessor, "0", { get: () => 7 });

    expect(() => createMockAdapter({ aliveMajorPlayerIds: [7, 2], aliveMajorCount: 2 })).toThrow(
      "aliveMajorPlayerIds or aliveMajorCount"
    );
    expect(() => createMockAdapter({ aliveMajorPlayerIds: [7, 7] })).toThrow("must be unique");
    expect(() => createMockAdapter({ aliveMajorPlayerIds: [64] })).toThrow("player ids 0..63");
    expect(() => createMockAdapter({ aliveMajorPlayerIds: sparse })).toThrow("sparse entries");
    expect(() => createMockAdapter({ aliveMajorPlayerIds: accessor })).toThrow("not accessors");
    expect(() => createMockAdapter({ aliveMajorCount: 2.5 })).toThrow("integer between 0 and 64");
    expect(() => createMockAdapter({ aliveMajorCount: 65 })).toThrow("integer between 0 and 64");
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

  it("reads current map layers into detached storage with their declared constructors", () => {
    const adapter = createMockAdapter({
      width: 2,
      height: 1,
      defaultTerrainType: 700,
      defaultBiomeType: 900,
      defaultElevation: 321,
    });
    adapter.setFeatureType(0, 0, { Feature: 40_000, Direction: -1, Elevation: 0 });
    adapter.setWater(1, 0, true);

    const terrain = adapter.readCurrentMapTerrainTypes();
    const elevations = adapter.readCurrentMapElevations();
    const biomes = adapter.readCurrentMapBiomeTypes();
    const features = adapter.readCurrentMapFeatureTypes();
    const water = adapter.readCurrentMapWaterMask();
    const lakes = adapter.readCurrentMapLakeMask();
    const areas = adapter.readCurrentMapAreaIds();

    expect(terrain).toBeInstanceOf(Int32Array);
    expect(elevations).toBeInstanceOf(Int16Array);
    expect(biomes).toBeInstanceOf(Int32Array);
    expect(features).toBeInstanceOf(Int32Array);
    expect(water).toBeInstanceOf(Uint8Array);
    expect(lakes).toBeInstanceOf(Uint8Array);
    expect(areas).toBeInstanceOf(Int32Array);
    expect(Array.from(terrain)).toEqual([700, 700]);
    expect(Array.from(elevations)).toEqual([321, 321]);
    expect(Array.from(biomes)).toEqual([900, 900]);
    expect(Array.from(features)).toEqual([40_000, -1]);
    expect(Array.from(water)).toEqual([0, 1]);
    expect(Array.from(lakes)).toEqual([0, 0]);
    expect(Array.from(areas)).toEqual([0, 1]);
    expect(adapter.readCurrentMapElevations()).not.toBe(elevations);
    expect(adapter.readCurrentMapBiomeTypes()).not.toBe(biomes);
    expect(adapter.readCurrentMapWaterMask()).not.toBe(water);
    expect(adapter.readCurrentMapLakeMask()).not.toBe(lakes);
    expect(adapter.readCurrentMapAreaIds()).not.toBe(areas);

    terrain[0] = 1;
    features[0] = 2;
    expect(adapter.getTerrainType(0, 0)).toBe(700);
    expect(adapter.getFeatureType(0, 0)).toBe(40_000);

    adapter.setTerrainType(0, 0, 701);
    adapter.setFeatureType(0, 0, { Feature: 40_001, Direction: -1, Elevation: 0 });
    const terrainAfter = adapter.readCurrentMapTerrainTypes();
    const featuresAfter = adapter.readCurrentMapFeatureTypes();
    expect(terrainAfter).not.toBe(terrain);
    expect(featuresAfter).not.toBe(features);
    expect(terrainAfter[0]).toBe(701);
    expect(featuresAfter[0]).toBe(40_001);
    expect(terrain[0]).toBe(1);
    expect(features[0]).toBe(2);
  });

  it("honors getter overrides for every detached layer and river observation", () => {
    class GetterOverrideAdapter extends MockAdapter {
      private index(x: number, y: number): number {
        return y * this.width + x;
      }

      override getTerrainType(x: number, y: number): number {
        return 100 + this.index(x, y);
      }

      override getElevation(x: number, y: number): number {
        return 200 + this.index(x, y);
      }

      override getBiomeType(x: number, y: number): number {
        return 300 + this.index(x, y);
      }

      override getFeatureType(x: number, y: number): number {
        return 400 + this.index(x, y);
      }

      override isWater(x: number, y: number): boolean {
        return this.index(x, y) % 2 === 1;
      }

      override isLake(x: number, y: number): boolean {
        return this.index(x, y) === 3;
      }

      override getAreaId(x: number, y: number): number {
        return 500 + this.index(x, y);
      }

      override getRiverType(x: number, y: number): number {
        return this.index(x, y) === 1 ? RIVER_TYPE_NAVIGABLE : NO_RIVER_TYPE;
      }

      override isRiver(x: number, y: number): boolean {
        return this.index(x, y) === 1;
      }

      override isNavigableRiver(x: number, y: number): boolean {
        return this.index(x, y) === 1;
      }
    }

    const adapter = new GetterOverrideAdapter({ width: 2, height: 2 });

    expect(Array.from(adapter.readCurrentMapTerrainTypes())).toEqual([100, 101, 102, 103]);
    expect(Array.from(adapter.readCurrentMapElevations())).toEqual([200, 201, 202, 203]);
    expect(Array.from(adapter.readCurrentMapBiomeTypes())).toEqual([300, 301, 302, 303]);
    expect(Array.from(adapter.readCurrentMapFeatureTypes())).toEqual([400, 401, 402, 403]);
    expect(Array.from(adapter.readCurrentMapWaterMask())).toEqual([0, 1, 0, 1]);
    expect(Array.from(adapter.readCurrentMapLakeMask())).toEqual([0, 0, 0, 1]);
    expect(Array.from(adapter.readCurrentMapAreaIds())).toEqual([500, 501, 502, 503]);

    const rivers = adapter.readCurrentRiverSurface();
    expect(Array.from(rivers.terrainType)).toEqual([100, 101, 102, 103]);
    expect(Array.from(rivers.riverType)).toEqual([
      NO_RIVER_TYPE,
      RIVER_TYPE_NAVIGABLE,
      NO_RIVER_TYPE,
      NO_RIVER_TYPE,
    ]);
    expect(Array.from(rivers.riverMask)).toEqual([0, 1, 0, 0]);
    expect(Array.from(rivers.navigableRiverMask)).toEqual([0, 1, 0, 0]);
    const nextRivers = adapter.readCurrentRiverSurface();
    expect(nextRivers).not.toBe(rivers);
    expect(nextRivers.terrainType).not.toBe(rivers.terrainType);
  });

  it("clears river metadata when reset returns the mock to a fresh map", () => {
    const adapter = createMockAdapter({ width: 2, height: 1 });
    const navigableTerrain = adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    adapter.setTerrainType(0, 0, navigableTerrain);
    adapter.modelRivers(0, 0, navigableTerrain);

    expect(Array.from(adapter.readCurrentRiverSurface().riverMask)).toEqual([1, 0]);

    adapter.reset();

    const resetSurface = adapter.readCurrentRiverSurface();
    expect(Array.from(resetSurface.riverMask)).toEqual([0, 0]);
    expect(Array.from(resetSurface.navigableRiverMask)).toEqual([0, 0]);
    expect(Array.from(resetSurface.minorRiverMask)).toEqual([0, 0]);
  });
});
