import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";

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

let Civ7AdapterCtor: typeof import("../src/civ7-adapter.js").Civ7Adapter;

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor } = await import("../src/civ7-adapter.js"));
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).GameplayMap;
});

describe("Civ7Adapter current map layers", () => {
  it("reads each official map channel into fresh row-major typed storage", () => {
    const width = 2;
    const height = 2;
    const index = (x: number, y: number): number => y * width + x;

    (globalThis as Record<string, unknown>).GameplayMap = {
      getTerrainType: (x: number, y: number) => 100_000 + index(x, y),
      getElevation: (x: number, y: number) => -100 + index(x, y),
      getBiomeType: (x: number, y: number) => 200_000 + index(x, y),
      getFeatureType: (x: number, y: number) => 300_000 + index(x, y),
      isWater: (x: number, y: number) => index(x, y) % 2 === 1,
      isLake: (x: number, y: number) => index(x, y) === 3,
      getAreaId: (x: number, y: number) => 400_000 + index(x, y),
    };

    const adapter = new Civ7AdapterCtor(width, height);
    const first = {
      terrain: adapter.readCurrentMapTerrainTypes(),
      elevation: adapter.readCurrentMapElevations(),
      biome: adapter.readCurrentMapBiomeTypes(),
      feature: adapter.readCurrentMapFeatureTypes(),
      water: adapter.readCurrentMapWaterMask(),
      lake: adapter.readCurrentMapLakeMask(),
      area: adapter.readCurrentMapAreaIds(),
    };

    expect(first.terrain).toBeInstanceOf(Int32Array);
    expect(first.elevation).toBeInstanceOf(Int16Array);
    expect(first.biome).toBeInstanceOf(Int32Array);
    expect(first.feature).toBeInstanceOf(Int32Array);
    expect(first.water).toBeInstanceOf(Uint8Array);
    expect(first.lake).toBeInstanceOf(Uint8Array);
    expect(first.area).toBeInstanceOf(Int32Array);
    expect(Array.from(first.terrain)).toEqual([100_000, 100_001, 100_002, 100_003]);
    expect(Array.from(first.elevation)).toEqual([-100, -99, -98, -97]);
    expect(Array.from(first.biome)).toEqual([200_000, 200_001, 200_002, 200_003]);
    expect(Array.from(first.feature)).toEqual([300_000, 300_001, 300_002, 300_003]);
    expect(Array.from(first.water)).toEqual([0, 1, 0, 1]);
    expect(Array.from(first.lake)).toEqual([0, 0, 0, 1]);
    expect(Array.from(first.area)).toEqual([400_000, 400_001, 400_002, 400_003]);

    const second = {
      terrain: adapter.readCurrentMapTerrainTypes(),
      elevation: adapter.readCurrentMapElevations(),
      biome: adapter.readCurrentMapBiomeTypes(),
      feature: adapter.readCurrentMapFeatureTypes(),
      water: adapter.readCurrentMapWaterMask(),
      lake: adapter.readCurrentMapLakeMask(),
      area: adapter.readCurrentMapAreaIds(),
    };
    for (const key of Object.keys(first) as Array<keyof typeof first>) {
      expect(second[key]).not.toBe(first[key]);
      expect(second[key]).toEqual(first[key]);
    }
  });
});
