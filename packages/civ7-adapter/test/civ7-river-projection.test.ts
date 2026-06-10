import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import {
  CIV7_BROWSER_TABLES_V0,
  NO_RIVER_TYPE,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "@civ7/map-policy";

mock.module("/base-standard/maps/map-globals.js", () => ({}));
mock.module("/base-standard/scripts/voronoi-utils.js", () => ({
  VoronoiUtils: {},
}));
mock.module("/base-standard/maps/feature-biome-generator.js", () => ({
  designateBiomes: () => {},
  addFeatures: () => {},
}));
mock.module("/base-standard/maps/snow-generator.js", () => ({
  generateSnow: () => {},
}));
mock.module("/base-standard/maps/discovery-generator.js", () => ({
  generateDiscoveries: () => {},
}));
mock.module("/base-standard/maps/resource-generator.js", () => ({}));
mock.module("/base-standard/maps/assign-starting-plots.js", () => ({
  assignStartPositions: () => [],
  chooseStartSectors: () => [],
}));
mock.module("/base-standard/maps/map-utilities.js", () => ({
  needHumanNearEquator: () => false,
}));
mock.module("/base-standard/maps/assign-advanced-start-region.js", () => ({
  assignAdvancedStartRegions: () => {},
}));
mock.module("/base-standard/maps/elevation-terrain-generator.js", () => ({
  generateLakes: () => {},
  expandCoasts: () => {},
}));

const NAVIGABLE_RIVER_TERRAIN =
  CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_NAVIGABLE_RIVER;

let Civ7AdapterCtor: typeof import("../src/civ7-adapter.js").Civ7Adapter;

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor } = await import("../src/civ7-adapter.js"));
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).GameInfo;
  delete (globalThis as Record<string, unknown>).GameplayMap;
  delete (globalThis as Record<string, unknown>).RiverTypes;
});

describe("Civ7Adapter river projection readback", () => {
  it("keeps terrain materialization separate when navigable metadata API is absent", () => {
    const width = 4;
    const height = 1;
    const terrain = [
      NAVIGABLE_RIVER_TERRAIN,
      NAVIGABLE_RIVER_TERRAIN,
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT,
      NAVIGABLE_RIVER_TERRAIN,
    ];
    const planned = new Uint8Array([1, 1, 1, 0]);

    (globalThis as any).RiverTypes = {
      NO_RIVER: NO_RIVER_TYPE,
      RIVER_MINOR: RIVER_TYPE_MINOR,
      RIVER_NAVIGABLE: RIVER_TYPE_NAVIGABLE,
    };
    (globalThis as any).GameInfo = {
      Terrains: [
        {
          TerrainType: "TERRAIN_NAVIGABLE_RIVER",
          Index: NAVIGABLE_RIVER_TERRAIN,
        },
      ],
    };
    (globalThis as any).GameplayMap = {
      getTerrainType: (x: number) => terrain[x] ?? 0,
      getRiverType: () => NO_RIVER_TYPE,
      isRiver: () => false,
    };

    const adapter = new Civ7AdapterCtor(width, height);
    expect(adapter.isNavigableRiver(0, 0)).toBe(false);

    const projection = adapter.readRiverProjection(width, height, planned);

    expect(Array.from(projection.terrainNavigableRiverMask)).toEqual([1, 1, 0, 1]);
    expect(Array.from(projection.engineNavigableRiverMask)).toEqual([0, 0, 0, 0]);
    expect(Array.from(projection.stampedNavigableRiverMask)).toEqual([1, 1, 0, 0]);
    expect(Array.from(projection.rejectedNavigableRiverMask)).toEqual([0, 0, 1, 0]);
    expect(Array.from(projection.navigableRiverMismatchMask)).toEqual([0, 0, 1, 1]);
    expect(projection.stampedNavigableRiverTileCount).toBe(2);
    expect(projection.rejectedNavigableRiverTileCount).toBe(1);
    expect(projection.extraNavigableRiverTileCount).toBe(1);
    expect(projection.navigableRiverMismatchTileCount).toBe(2);
    expect(projection.engineNavigableRiverTileCount).toBe(0);
    expect(projection.terrainNavigableRiverTileCount).toBe(3);
    expect(projection.minorRiverStampingSupported).toBe(true);
    expect(projection.minorRiverUnsupportedReason).toContain("TerrainBuilder.modelRivers");
  });

  it("falls back to river metadata for isNavigableRiver when the API is absent", () => {
    (globalThis as any).RiverTypes = {
      NO_RIVER: NO_RIVER_TYPE,
      RIVER_MINOR: RIVER_TYPE_MINOR,
      RIVER_NAVIGABLE: RIVER_TYPE_NAVIGABLE,
    };
    (globalThis as any).GameInfo = {
      Terrains: [
        {
          TerrainType: "TERRAIN_NAVIGABLE_RIVER",
          Index: NAVIGABLE_RIVER_TERRAIN,
        },
      ],
    };
    (globalThis as any).GameplayMap = {
      getTerrainType: () => CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT,
      getRiverType: (x: number) => (x === 0 ? RIVER_TYPE_NAVIGABLE : RIVER_TYPE_MINOR),
      isRiver: () => true,
    };

    const adapter = new Civ7AdapterCtor(2, 1);

    expect(adapter.isNavigableRiver(0, 0)).toBe(true);
    expect(adapter.isNavigableRiver(1, 0)).toBe(false);

    const projection = adapter.readRiverProjection(2, 1, new Uint8Array([0, 0]));
    expect(Array.from(projection.engineMinorRiverMask)).toEqual([0, 1]);
    expect(projection.engineMinorRiverTileCount).toBe(1);
    expect(projection.minorRiverStampingSupported).toBe(true);
  });

  it("uses map-policy river constants when the runtime RiverTypes global is absent", () => {
    (globalThis as any).GameInfo = {
      Terrains: [
        {
          TerrainType: "TERRAIN_NAVIGABLE_RIVER",
          Index: NAVIGABLE_RIVER_TERRAIN,
        },
      ],
    };
    (globalThis as any).GameplayMap = {
      getTerrainType: () => CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT,
      getRiverType: (x: number) => (x === 0 ? RIVER_TYPE_NAVIGABLE : RIVER_TYPE_MINOR),
      isRiver: () => true,
    };

    const adapter = new Civ7AdapterCtor(2, 1);

    expect(adapter.isNavigableRiver(0, 0)).toBe(true);
    expect(adapter.isNavigableRiver(1, 0)).toBe(false);

    const projection = adapter.readRiverProjection(2, 1, new Uint8Array([0, 0]));
    expect(Array.from(projection.engineNavigableRiverMask)).toEqual([1, 0]);
    expect(Array.from(projection.engineMinorRiverMask)).toEqual([0, 1]);
    expect(projection.minorRiverStampingSupported).toBe(true);
  });

  it("keeps minor-river metadata unsupported when the native river-type contract is absent", () => {
    (globalThis as any).GameInfo = {
      Terrains: [
        {
          TerrainType: "TERRAIN_NAVIGABLE_RIVER",
          Index: NAVIGABLE_RIVER_TERRAIN,
        },
      ],
    };
    (globalThis as any).GameplayMap = {
      getTerrainType: () => CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT,
      isRiver: () => false,
    };

    const adapter = new Civ7AdapterCtor(1, 1);
    const projection = adapter.readRiverProjection(1, 1, new Uint8Array([0]));

    expect(projection.minorRiverStampingSupported).toBe(false);
    expect(projection.minorRiverUnsupportedReason).toContain("unavailable");
  });
});
