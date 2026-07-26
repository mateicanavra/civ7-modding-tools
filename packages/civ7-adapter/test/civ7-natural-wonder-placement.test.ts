import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

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

const WIDTH = 4;
const HEIGHT = 6;
const REDWOOD_FOOTPRINT = [9, 13, 10] as const;
const REDWOOD_FEATURE_TYPE = CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_REDWOOD_FOREST;
const NO_FEATURE = -1;

let Civ7AdapterCtor: typeof import("../src/civ7-adapter.js").Civ7Adapter;

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor } = await import("../src/civ7-adapter.js"));
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).GameplayMap;
  delete (globalThis as Record<string, unknown>).TerrainBuilder;
});

function installNaturalWonderRuntime(writeFootprint: readonly number[]): Int32Array {
  const featureTypes = new Int32Array(WIDTH * HEIGHT).fill(NO_FEATURE);
  (globalThis as Record<string, unknown>).GameplayMap = {
    getElevation: () => 120,
    getFeatureType: (x: number, y: number) => featureTypes[y * WIDTH + x] ?? NO_FEATURE,
  };
  (globalThis as Record<string, unknown>).TerrainBuilder = {
    canHaveFeatureParam: () => true,
    setFeatureType: (_x: number, _y: number, featureData: Readonly<{ Feature: number }>) => {
      for (const plotIndex of writeFootprint) {
        featureTypes[plotIndex] = featureData.Feature;
      }
    },
  };
  return featureTypes;
}

describe("Civ7Adapter natural-wonder placement", () => {
  it("accepts a complete multi-tile engine write after exact footprint readback", () => {
    const featureTypes = installNaturalWonderRuntime(REDWOOD_FOOTPRINT);
    const adapter = new Civ7AdapterCtor(WIDTH, HEIGHT);

    const outcome = adapter.placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0, 120);

    expect(outcome).toEqual({
      status: "placed",
      plotIndex: 9,
      x: 1,
      y: 2,
      featureType: REDWOOD_FEATURE_TYPE,
      direction: 0,
      elevation: 120,
    });
    expect(REDWOOD_FOOTPRINT.map((plotIndex) => featureTypes[plotIndex])).toEqual([
      REDWOOD_FEATURE_TYPE,
      REDWOOD_FEATURE_TYPE,
      REDWOOD_FEATURE_TYPE,
    ]);
  });

  it("rejects a partial multi-tile engine write with exact footprint evidence", () => {
    installNaturalWonderRuntime(REDWOOD_FOOTPRINT.slice(0, 2));
    const adapter = new Civ7AdapterCtor(WIDTH, HEIGHT);

    const outcome = adapter.placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0, 120);

    expect(outcome).toEqual({
      status: "rejected",
      plotIndex: 9,
      x: 1,
      y: 2,
      featureType: REDWOOD_FEATURE_TYPE,
      direction: 0,
      elevation: 120,
      reason: "readback-mismatch",
      observedFeatureType: NO_FEATURE,
      observedPlotIndex: 10,
      expectedFootprintReadback: [
        { plotIndex: 9, observedFeatureType: REDWOOD_FEATURE_TYPE },
        { plotIndex: 13, observedFeatureType: REDWOOD_FEATURE_TYPE },
        { plotIndex: 10, observedFeatureType: NO_FEATURE },
      ],
      expectedFootprintReadbackStatus: "partial-expected-footprint",
    });
  });
});
