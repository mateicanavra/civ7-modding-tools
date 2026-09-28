import { describe, expect, it, mock } from "bun:test";
import { NO_RIVER_TYPE, RIVER_TYPE_MINOR, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
import {
  captureCurrentMapElevationSnapshot,
  copyElevationIntent,
} from "../../src/current-map-surface.js";

import {
  createMockAdapter,
  DEFAULT_PLOT_EFFECT_TYPES,
  MockAdapter,
} from "../../src/mock-adapter.js";
import type { RiverDirection, RiverFinalizationArgs, RiverWriteIntent } from "../../src/types.js";

describe("MockAdapter", () => {
  it.each([
    [Number.NaN, 2],
    [1.5, 2],
    [2, 1.5],
    [0, 2],
    [2, -1],
    [Number.POSITIVE_INFINITY, 2],
    [Number.MAX_SAFE_INTEGER + 1, 1],
    [Number.MAX_SAFE_INTEGER, 2],
  ])("rejects malformed elevation dimensions %s x %s before reads", (width, height) => {
    const read = mock(() => 0);
    expect(() => copyElevationIntent([1, 2, 3], width, height)).toThrow("positive safe integer");
    expect(() =>
      captureCurrentMapElevationSnapshot({ source: "mock", width, height, read })
    ).toThrow("positive safe integer");
    expect(read).not.toHaveBeenCalled();
  });

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

  it("stores exact detached elevation intent and records cliffs without emulating native effects", () => {
    const adapter = createMockAdapter({ width: 3, height: 2 });
    const intent = [-0, -7.25, 0.125, 65_536.5, 0, 1.23456789012345];
    const expected = [...intent];
    const terrain = adapter.readCurrentMapTerrainTypes();
    const water = adapter.readCurrentMapWaterMask();
    adapter.setElevation(intent);
    const first = adapter.readCurrentMapElevationSnapshot();
    expect(first.status).toBe("available");
    if (first.status !== "available") throw new Error("Expected mock elevation state.");
    expect(first.source).toBe("mock");
    expect([first.width, first.height]).toEqual([3, 2]);
    expect(first.values).toBeInstanceOf(Float64Array);
    expect(Array.from(first.values)).toEqual(expected);
    expect(Object.is(first.values[0], -0)).toBe(true);
    expect(adapter.getElevation(0, 1)).toBe(expected[3]);

    intent[1] = 999;
    first.values[2] = 999;
    adapter.calls.setElevation[0]![3] = 999;
    adapter.generateCliffsFromElevation();
    adapter.generateCliffsFromElevation();
    const second = adapter.readCurrentMapElevationSnapshot();
    expect(second.status).toBe("available");
    if (second.status !== "available") throw new Error("Expected mock elevation state.");
    expect(second.values).not.toBe(first.values);
    expect(Array.from(second.values)).toEqual(expected);
    expect(adapter.calls.generateCliffsFromElevation).toBe(2);
    expect(adapter.readCurrentMapTerrainTypes()).toEqual(terrain);
    expect(adapter.readCurrentMapWaterMask()).toEqual(water);

    adapter.reset({ defaultElevation: -0.375 });
    expect(adapter.getElevation(0, 1)).toBe(-0.375);
    expect(adapter.calls.setElevation).toEqual([]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
  });

  it.each([
    ["short", [0]],
    ["long", [0, 1, 2]],
    ["sparse", new Array<number>(2)],
    ["NaN", [0, Number.NaN]],
    ["infinity", [0, Number.POSITIVE_INFINITY]],
    ["negative infinity", [0, Number.NEGATIVE_INFINITY]],
    ["non-number", [0, "1"]],
    ["typed array", new Float64Array([0, 1])],
  ])("refuses %s elevation intent without changing stored state", (_label, invalid) => {
    const adapter = createMockAdapter({ width: 2, height: 1 });
    const before = adapter.readCurrentMapElevationSnapshot();
    expect(() => adapter.setElevation(invalid as readonly number[])).toThrow();
    expect(adapter.readCurrentMapElevationSnapshot()).toEqual(before);
    expect(adapter.calls.setElevation).toEqual([]);
  });

  it("uses exact overridable numeric getters for snapshots and reports unavailable values", () => {
    class FractionalElevationAdapter extends MockAdapter {
      override getElevation(x: number, y: number): number {
        return y * 3 + x + 0.125;
      }
    }
    const adapter = new FractionalElevationAdapter({ width: 3, height: 2 });
    const observed = adapter.readCurrentMapElevationSnapshot();
    expect(observed.status).toBe("available");
    if (observed.status !== "available") throw new Error("Expected mock elevation state.");
    expect(Array.from(observed.values)).toEqual([0.125, 1.125, 2.125, 3.125, 4.125, 5.125]);

    class UnavailableElevationAdapter extends MockAdapter {
      override getElevation(): number {
        return Number.NaN;
      }
    }
    expect(
      new UnavailableElevationAdapter({ width: 3, height: 2 }).readCurrentMapElevationSnapshot()
    ).toEqual({
      source: "mock",
      width: 3,
      height: 2,
      status: "unavailable",
      reason: "non-finite-value",
      plotIndex: 0,
    });
  });

  it("preserves resource-age policy hooks across reset", () => {
    expect(createMockAdapter().isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBeNull();

    const adapter = createMockAdapter({
      isResourceRequiredForAge: (resourceTypeId, ageType) => {
        expect(ageType).toBe("AGE_ANTIQUITY");
        if (resourceTypeId === 11) return true;
        if (resourceTypeId === 12) return false;
        return null;
      },
    });
    expect(adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBe(true);
    expect(adapter.isResourceRequiredForAge(12, "AGE_ANTIQUITY")).toBe(false);
    expect(adapter.isResourceRequiredForAge(13, "AGE_ANTIQUITY")).toBeNull();

    const policyError = new Error("mock policy failed");
    adapter.reset({
      isResourceRequiredForAge: () => {
        throw policyError;
      },
    });
    expect(() => adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toThrow(policyError);

    adapter.reset({ isResourceRequiredForAge: () => true });
    adapter.reset();
    expect(adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBe(true);
    adapter.reset({ isResourceRequiredForAge: () => false });
    expect(adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBe(false);
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
    adapter.setFeatureType(0, 0, {
      Feature: 40_000,
      Direction: -1,
      Elevation: 0,
    });
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
    adapter.setFeatureType(0, 0, {
      Feature: 40_001,
      Direction: -1,
      Elevation: 0,
    });
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

describe("MockAdapter explicit river intent (not native proof)", () => {
  it("records detached symbolic intents and applies declared classes only at finalization", () => {
    const adapter = createMockAdapter({ width: 4, height: 3 });
    expect(adapter.getRiverCapabilities()).toEqual({
      source: "mock",
      setRiverInfo: { status: "available" },
      finalizeRivers: { status: "available" },
      riverTypeReadback: { status: "available" },
    });
    const mountain = adapter.getTerrainTypeIndex("TERRAIN_MOUNTAIN");
    const navigable = adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    adapter.setTerrainType(0, 1, mountain);
    const minor = { x: 0, y: 1, direction: "EAST", riverClass: "MINOR" } satisfies RiverWriteIntent;
    const nav = { x: 1, y: 1, direction: "WEST", riverClass: "NAVIGABLE" } satisfies RiverWriteIntent;
    adapter.setRiverInfo(minor);
    adapter.setRiverInfo(nav);
    expect(adapter.getRiverType(0, 1)).toBe(NO_RIVER_TYPE);
    expect(adapter.getRiverType(1, 1)).toBe(NO_RIVER_TYPE);
    expect(adapter.calls.setRiverInfo).toEqual([minor, nav]);
    expect(adapter.calls.setRiverInfo[0]).not.toBe(minor);
    minor.x = 3;
    nav.x = 3;
    const args: [boolean, number, number, number] = [false, 25, 2, 2];
    adapter.finalizeRivers(args);
    args[1] = 99;
    expect(adapter.calls.finalizeRivers).toEqual([[false, 25, 2, 2]]);
    expect(adapter.getRiverType(0, 1)).toBe(RIVER_TYPE_MINOR);
    expect(adapter.getRiverType(1, 1)).toBe(RIVER_TYPE_NAVIGABLE);
    expect(adapter.getRiverType(3, 1)).toBe(NO_RIVER_TYPE);
    expect(adapter.getTerrainType(0, 1)).toBe(mountain);
    expect(adapter.getTerrainType(1, 1)).toBe(navigable);
  });

  it("supports all geographic symbols without inventing receiver, slope or ocean connectivity", () => {
    const adapter = createMockAdapter({ width: 8, height: 3 });
    const symbols: RiverDirection[] = [
      "EAST", "NORTHEAST", "NORTHWEST", "WEST", "SOUTHWEST", "SOUTHEAST",
    ];
    adapter.setElevation(Array.from({ length: 24 }, (_, i) => i % 8 === 1 ? 1 : 700));
    symbols.forEach((direction, x) =>
      adapter.setRiverInfo({ x: x + 1, y: 1, direction, riverClass: "NAVIGABLE" })
    );
    adapter.finalizeRivers([true, 0, 0x7fffffff, 0x7fffffff]);
    for (let x = 1; x <= 6; x++) expect(adapter.getRiverType(x, 1)).toBe(RIVER_TYPE_NAVIGABLE);
    expect(adapter.getRiverType(0, 1)).toBe(NO_RIVER_TYPE);
    expect(adapter.getRiverType(7, 1)).toBe(NO_RIVER_TYPE);
    expect(adapter.getElevation(1, 1)).toBe(1);
    expect(adapter.calls.setRiverInfo.map(({ direction }) => direction)).toEqual(symbols);
    expect(adapter.getRiverCapabilities().source).toBe("mock");
  });

  it("last intent at a plot wins and repeat finalizations remain explicit test calls, not native idempotence evidence", () => {
    const adapter = createMockAdapter({ width: 3, height: 2 });
    const terrain = adapter.getTerrainType(1, 1);
    adapter.setRiverInfo({ x: 1, y: 1, direction: "EAST", riverClass: "NAVIGABLE" });
    adapter.setRiverInfo({ x: 1, y: 1, direction: "WEST", riverClass: "MINOR" });
    adapter.finalizeRivers([false, 0, 0, 0]);
    adapter.finalizeRivers([true, 100, 4, 0]);
    expect(adapter.calls.finalizeRivers).toEqual([[false, 0, 0, 0], [true, 100, 4, 0]]);
    expect(adapter.getRiverType(1, 1)).toBe(RIVER_TYPE_MINOR);
    expect(adapter.getTerrainType(1, 1)).toBe(terrain);
    adapter.reset();
    expect(adapter.calls.setRiverInfo).toEqual([]);
    expect(adapter.calls.finalizeRivers).toEqual([]);
    adapter.finalizeRivers([false, 25, 2, 2]);
    expect(adapter.getRiverType(1, 1)).toBe(NO_RIVER_TYPE);
  });

  it("invalid inputs change neither recorded calls nor simulated state", () => {
    const adapter = createMockAdapter({ width: 3, height: 2 });
    const valid: RiverWriteIntent = { x: 1, y: 1, direction: "EAST", riverClass: "MINOR" };
    const invalid: unknown[] = [null, [], {}, { ...valid, x: -1 }, { ...valid, y: 2 },
      { ...valid, x: 3 }, { ...valid, x: 0.5 }, { ...valid, y: NaN }, { ...valid, y: "1" },
      { ...valid, direction: 0 }, { ...valid, direction: "east" }, { ...valid, direction: "toString" },
      { ...valid, direction: { toString: () => "EAST" } }, { ...valid, riverClass: 1 },
    ];
    for (const intent of invalid) expect(() => adapter.setRiverInfo(intent as RiverWriteIntent)).toThrow();
    const invalidArgs: unknown[] = [undefined, [], [false, 25, 2], [false, 25, 2, 2, 2],
      [1, 25, 2, 2], [false, -1, 2, 2], [false, 101, 2, 2], [false, 0.5, 2, 2],
      [false, 25, -1, 2], [false, 25, 2, -1], [false, 25, NaN, 2], [false, 25, 2, Infinity],
      [false, 25, 0x80000000, 2], [false, 25, 2, 0x80000000], [false, "25", 2, 2],
      Object.assign(new Array(4), { 0: false, 1: 25, 3: 2 }),
    ];
    for (const args of invalidArgs) expect(() => adapter.finalizeRivers(args as RiverFinalizationArgs)).toThrow();
    expect(adapter.calls.setRiverInfo).toEqual([]);
    expect(adapter.calls.finalizeRivers).toEqual([]);
    expect(adapter.isRiver(1, 1)).toBe(false);
  });
});
