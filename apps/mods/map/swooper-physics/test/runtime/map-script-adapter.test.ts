import { afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import {
  CIV7_BROWSER_TABLES_V0,
  NO_RESOURCE,
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

type OfficialDiscoveryGenerator = (
  width: number,
  height: number,
  startPositions: readonly number[],
  polarMargin: number
) => void;

type AddDiscovery = (
  x: number,
  y: number,
  discoveryVisualType: number,
  discoveryActivationType: number
) => boolean;

type DiscoveryRuntime = { addDiscovery?: AddDiscovery };

let runOfficialDiscoveryGenerator: OfficialDiscoveryGenerator = () => {};
let Civ7AdapterCtor: typeof import("../../src/runtime/map-script/adapter.js").Civ7Adapter;
let queryCiv7ResourceRequirementForAge: typeof import("../../src/runtime/map-script/adapter.js").queryCiv7ResourceRequirementForAge;

mock.module("/base-standard/maps/discovery-generator.js", () => ({
  generateDiscoveries: (
    width: number,
    height: number,
    startPositions: readonly number[],
    polarMargin: number
  ) => runOfficialDiscoveryGenerator(width, height, startPositions, polarMargin),
}));

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor, queryCiv7ResourceRequirementForAge } = await import(
    "../../src/runtime/map-script/adapter.js"
  ));
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).GameplayMap;
  delete (globalThis as Record<string, unknown>).TerrainBuilder;
  delete (globalThis as Record<string, unknown>).ResourceBuilder;
  delete (globalThis as Record<string, unknown>).GameInfo;
  delete (globalThis as Record<string, unknown>).RiverTypes;
  delete (globalThis as Record<string, unknown>).MapConstructibles;
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

describe("Civ7Adapter exact elevation capabilities", () => {
  it.each([
    [Number.NaN, 2],
    [1.5, 2],
    [2, 1.5],
    [0, 2],
    [2, -1],
    [Number.POSITIVE_INFINITY, 2],
    [Number.MAX_SAFE_INTEGER + 1, 1],
    [Number.MAX_SAFE_INTEGER, 2],
  ])("rejects malformed dimensions %s x %s before native reads or writes", (width, height) => {
    const setElevation = mock(() => {});
    const getElevation = mock(() => 0);
    (globalThis as Record<string, unknown>).TerrainBuilder = { setElevation };
    (globalThis as Record<string, unknown>).GameplayMap = { getElevation };
    const adapter = new Civ7AdapterCtor(width, height);
    expect(() => adapter.setElevation([1, 2, 3])).toThrow("positive safe integer");
    expect(() => adapter.readCurrentMapElevationSnapshot()).toThrow("positive safe integer");
    expect(setElevation).not.toHaveBeenCalled();
    expect(getElevation).not.toHaveBeenCalled();
  });

  it("dispatches a detached ordinary array and cliffs as separate native calls", () => {
    const intent = Object.freeze([-0, -2.5, 0.125, 65_536.5, 3, 1.23456789012345]);
    const calls: string[] = [];
    let dispatched: number[] | undefined;
    const terrainBuilder = {
      setElevation(values: number[]) {
        expect(this).toBe(terrainBuilder);
        expect(Array.isArray(values)).toBe(true);
        expect(values).not.toBe(intent);
        expect(values).toEqual([...intent]);
        dispatched = values;
        calls.push("setElevation");
      },
      generateCliffsFromElevation() {
        expect(this).toBe(terrainBuilder);
        calls.push("generateCliffsFromElevation");
      },
      buildElevation: () => {
        throw new Error("Stock elevation must not be invoked.");
      },
    };
    (globalThis as Record<string, unknown>).TerrainBuilder = terrainBuilder;
    const adapter = new Civ7AdapterCtor(3, 2);
    adapter.setElevation(intent);
    expect(calls).toEqual(["setElevation"]);
    adapter.generateCliffsFromElevation();
    expect(calls).toEqual(["setElevation", "generateCliffsFromElevation"]);
    dispatched![0] = 999;
    expect(Object.is(intent[0], -0)).toBe(true);
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
  ])("rejects %s elevation intent before native mutation", (_label, invalid) => {
    const setElevation = mock(() => {});
    const generateCliffsFromElevation = mock(() => {});
    (globalThis as Record<string, unknown>).TerrainBuilder = {
      setElevation,
      generateCliffsFromElevation,
    };
    const adapter = new Civ7AdapterCtor(2, 1);
    expect(() => adapter.setElevation(invalid as readonly number[])).toThrow();
    expect(setElevation).not.toHaveBeenCalled();
    expect(generateCliffsFromElevation).not.toHaveBeenCalled();
  });

  it("refuses missing native writers rather than falling back to stock generation", () => {
    const adapter = new Civ7AdapterCtor(1, 1);
    expect(() => adapter.setElevation([0])).toThrow("setElevation is unavailable");
    expect(() => adapter.generateCliffsFromElevation()).toThrow(
      "generateCliffsFromElevation is unavailable"
    );
    const buildElevation = mock(() => {});
    (globalThis as Record<string, unknown>).TerrainBuilder = { buildElevation };
    expect(() => adapter.setElevation([0])).toThrow("setElevation is unavailable");
    expect(() => adapter.generateCliffsFromElevation()).toThrow(
      "generateCliffsFromElevation is unavailable"
    );
    expect(buildElevation).not.toHaveBeenCalled();
  });

  it("preserves native dispatch errors without retrying", () => {
    const error = new Error("Native writer failed after dispatch.");
    const setElevation = mock(() => {
      throw error;
    });
    const generateCliffsFromElevation = mock(() => {
      throw error;
    });
    (globalThis as Record<string, unknown>).TerrainBuilder = {
      setElevation,
      generateCliffsFromElevation,
    };
    const adapter = new Civ7AdapterCtor(1, 1);
    expect(() => adapter.setElevation([0.5])).toThrow(error);
    expect(setElevation).toHaveBeenCalledTimes(1);
    expect(generateCliffsFromElevation).not.toHaveBeenCalled();
    expect(() => adapter.generateCliffsFromElevation()).toThrow(error);
    expect(generateCliffsFromElevation).toHaveBeenCalledTimes(1);
  });

  it("reads asymmetric row-major native numbers without truncation or aliasing", () => {
    const values = [-0, -7.25, 0.125, 65_536.5, 0, 1.23456789012345];
    const coordinates: number[][] = [];
    const gameplayMap = {
      getElevation(x: number, y: number) {
        expect(this).toBe(gameplayMap);
        coordinates.push([x, y]);
        return values[y * 3 + x]!;
      },
    };
    (globalThis as Record<string, unknown>).GameplayMap = gameplayMap;
    const adapter = new Civ7AdapterCtor(3, 2);
    const first = adapter.readCurrentMapElevationSnapshot();
    expect(first.status).toBe("available");
    if (first.status !== "available") throw new Error("Expected native getter readback.");
    expect(first.source).toBe("native");
    expect([first.width, first.height]).toEqual([3, 2]);
    expect(first.values).toBeInstanceOf(Float64Array);
    expect(Array.from(first.values)).toEqual(values);
    expect(coordinates).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
    first.values[1] = 999;
    const second = adapter.readCurrentMapElevationSnapshot();
    expect(second.status).toBe("available");
    if (second.status !== "available") throw new Error("Expected native getter readback.");
    expect(second.values).not.toBe(first.values);
    expect(Array.from(second.values)).toEqual(values);
    values[2] = 99;
    expect(second.values[2]).toBe(0.125);
  });

  it("reports absent native numeric readback explicitly", () => {
    const adapter = new Civ7AdapterCtor(3, 2);
    const expected = {
      source: "native",
      width: 3,
      height: 2,
      status: "unavailable",
      reason: "getter-unavailable",
    } as const;
    expect(adapter.readCurrentMapElevationSnapshot()).toEqual(expected);
    (globalThis as Record<string, unknown>).GameplayMap = {};
    expect(adapter.readCurrentMapElevationSnapshot()).toEqual(expected);
  });

  it.each([
    ["NaN", (): number => Number.NaN, "non-finite-value"],
    ["infinity", (): number => Number.POSITIVE_INFINITY, "non-finite-value"],
    ["non-number", (): string => "0", "non-finite-value"],
    [
      "exception",
      (): never => {
        throw new Error("Native read failed.");
      },
      "read-failed",
    ],
  ] as const)("does not turn %s native readback into partial or zero-valued evidence", (_label, read, reason) => {
    (globalThis as Record<string, unknown>).GameplayMap = {
      getElevation: (x: number, y: number) => (y * 3 + x === 4 ? read() : 0.25),
    };
    expect(new Civ7AdapterCtor(3, 2).readCurrentMapElevationSnapshot()).toEqual({
      source: "native",
      width: 3,
      height: 2,
      status: "unavailable",
      reason,
      plotIndex: 4,
    });
  });
});

describe("Civ7Adapter procedural river compatibility", () => {
  it("dispatches the shipped river model without exposing the removed naming API", () => {
    const modelRivers = mock(() => {});
    (globalThis as Record<string, unknown>).TerrainBuilder = { modelRivers };
    const adapter = new Civ7AdapterCtor(2, 2);

    adapter.modelRivers(5, 15, 7);

    expect(modelRivers).toHaveBeenCalledTimes(1);
    expect(modelRivers).toHaveBeenCalledWith(5, 15, 7);
    expect("defineNamedRivers" in adapter).toBe(false);
  });
});

const WIDTH = 4;
const HEIGHT = 6;
const REDWOOD_FOOTPRINT = [9, 13, 10] as const;
const REDWOOD_FEATURE_TYPE = CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_REDWOOD_FOREST;
const NO_FEATURE = -1;

function installNaturalWonderRuntime(
  writeFootprint: readonly number[],
  options: Readonly<{
    canHaveFeatureParam?: boolean;
    setFeatureResult?: boolean;
  }> = {}
): Int32Array {
  const featureTypes = new Int32Array(WIDTH * HEIGHT).fill(NO_FEATURE);
  (globalThis as Record<string, unknown>).GameplayMap = {
    getElevation: () => 120,
    getFeatureType: (x: number, y: number) => featureTypes[y * WIDTH + x] ?? NO_FEATURE,
  };
  (globalThis as Record<string, unknown>).TerrainBuilder = {
    canHaveFeatureParam: () => options.canHaveFeatureParam ?? true,
    setFeatureType: (_x: number, _y: number, featureData: Readonly<{ Feature: number }>) => {
      if (options.setFeatureResult === false) return false;
      for (const plotIndex of writeFootprint) featureTypes[plotIndex] = featureData.Feature;
      return options.setFeatureResult;
    },
  };
  return featureTypes;
}

describe("Civ7Adapter natural-wonder placement", () => {
  it("reads fresh fractional native elevation for each placement without an explicit override", () => {
    const featureTypes = new Int32Array(WIDTH * HEIGHT).fill(NO_FEATURE);
    type FeatureData = Readonly<{ Feature: number; Direction: number; Elevation: number }>;
    const elevationReads: Array<[number, number]> = [];
    const legalityCalls: Array<{ x: number; y: number; featureData: FeatureData }> = [];
    const writeCalls: Array<{ x: number; y: number; featureData: FeatureData }> = [];
    let nativeElevation = 350.125;
    (globalThis as Record<string, unknown>).GameplayMap = {
      getElevation: (x: number, y: number) => {
        elevationReads.push([x, y]);
        return nativeElevation;
      },
      getFeatureType: (x: number, y: number) => featureTypes[y * WIDTH + x] ?? NO_FEATURE,
    };
    (globalThis as Record<string, unknown>).TerrainBuilder = {
      canHaveFeatureParam: (
        x: number,
        y: number,
        _featureType: number,
        featureData: FeatureData
      ) => {
        legalityCalls.push({ x, y, featureData: { ...featureData } });
        return true;
      },
      setFeatureType: (x: number, y: number, featureData: FeatureData) => {
        writeCalls.push({ x, y, featureData: { ...featureData } });
        for (const plotIndex of REDWOOD_FOOTPRINT) featureTypes[plotIndex] = featureData.Feature;
        return true;
      },
    };

    const adapter = new Civ7AdapterCtor(WIDTH, HEIGHT);
    expect(adapter.placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0)).toMatchObject({
      status: "placed",
      elevation: 350.125,
    });
    nativeElevation = 901.625;
    expect(adapter.placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0)).toMatchObject({
      status: "placed",
      elevation: 901.625,
    });

    const expectedCalls = [350.125, 901.625].map((Elevation) => ({
      x: 1,
      y: 2,
      featureData: { Feature: REDWOOD_FEATURE_TYPE, Direction: 0, Elevation },
    }));
    expect(elevationReads).toEqual([
      [1, 2],
      [1, 2],
    ]);
    expect(legalityCalls).toEqual(expectedCalls);
    expect(writeCalls).toEqual(expectedCalls);
  });

  it("accepts a complete multi-tile engine write after exact footprint readback", () => {
    const featureTypes = installNaturalWonderRuntime(REDWOOD_FOOTPRINT);
    const outcome = new Civ7AdapterCtor(WIDTH, HEIGHT).placeNaturalWonder(
      1,
      2,
      REDWOOD_FEATURE_TYPE,
      0,
      120
    );
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
    expect(
      new Civ7AdapterCtor(WIDTH, HEIGHT).placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0, 120)
    ).toEqual({
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

  it("rejects an anchor whose footprint crosses the live adapter boundary", () => {
    installNaturalWonderRuntime([]);
    expect(
      new Civ7AdapterCtor(WIDTH, HEIGHT).placeNaturalWonder(
        1,
        HEIGHT - 1,
        REDWOOD_FEATURE_TYPE,
        0,
        120
      )
    ).toEqual({
      status: "rejected",
      plotIndex: 21,
      x: 1,
      y: 5,
      featureType: REDWOOD_FEATURE_TYPE,
      direction: 0,
      elevation: 120,
      reason: "unsupported-footprint",
    });
  });

  it("reports live engine legality and mutation refusals without invented readback evidence", () => {
    installNaturalWonderRuntime([], { canHaveFeatureParam: false });
    expect(
      new Civ7AdapterCtor(WIDTH, HEIGHT).placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0, 120)
    ).toEqual({
      status: "rejected",
      plotIndex: 9,
      x: 1,
      y: 2,
      featureType: REDWOOD_FEATURE_TYPE,
      direction: 0,
      elevation: 120,
      reason: "can-have-feature-param-false",
    });
    installNaturalWonderRuntime([], { setFeatureResult: false });
    expect(
      new Civ7AdapterCtor(WIDTH, HEIGHT).placeNaturalWonder(1, 2, REDWOOD_FEATURE_TYPE, 0, 120)
    ).toEqual({
      status: "rejected",
      plotIndex: 9,
      x: 1,
      y: 2,
      featureType: REDWOOD_FEATURE_TYPE,
      direction: 0,
      elevation: 120,
      reason: "set-feature-false",
    });
  });
});

const SYNTHETIC_WIDTH = 4;
const SYNTHETIC_HEIGHT = 3;
const RESOURCE_TYPE = 7;

function installResourceRuntime(readbackOverride?: number): {
  resources: Int32Array;
  feasibilityCalls: Array<{
    x: number;
    y: number;
    resourceType: number;
    ignoreWeight: boolean | undefined;
  }>;
  writeCalls: Array<{ x: number; y: number; resourceType: number }>;
} {
  const resources = new Int32Array(SYNTHETIC_WIDTH * SYNTHETIC_HEIGHT).fill(NO_RESOURCE);
  const feasibilityCalls: Array<{
    x: number;
    y: number;
    resourceType: number;
    ignoreWeight: boolean | undefined;
  }> = [];
  const writeCalls: Array<{ x: number; y: number; resourceType: number }> = [];
  (globalThis as Record<string, unknown>).GameplayMap = {
    getResourceType: (x: number, y: number) =>
      readbackOverride ?? resources[y * SYNTHETIC_WIDTH + x] ?? NO_RESOURCE,
  };
  (globalThis as Record<string, unknown>).ResourceBuilder = {
    canHaveResource: (x: number, y: number, resourceType: number, ignoreWeight?: boolean) => {
      feasibilityCalls.push({ x, y, resourceType, ignoreWeight });
      return true;
    },
    setResourceType: (x: number, y: number, resourceType: number) => {
      writeCalls.push({ x, y, resourceType });
      resources[y * SYNTHETIC_WIDTH + x] = resourceType;
    },
  };
  return { resources, feasibilityCalls, writeCalls };
}

describe("Civ7Adapter resource placement", () => {
  it("derives adapter-owned coordinates and accepts exact engine readback", () => {
    const runtime = installResourceRuntime();
    expect(
      new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT).placeResourceIntent({
        plotIndex: 5,
        resourceType: RESOURCE_TYPE,
      })
    ).toEqual({
      status: "placed",
      plotIndex: 5,
      x: 1,
      y: 1,
      resourceType: RESOURCE_TYPE,
      observedResourceType: RESOURCE_TYPE,
    });
    expect(runtime.feasibilityCalls).toEqual([
      { x: 1, y: 1, resourceType: RESOURCE_TYPE, ignoreWeight: false },
    ]);
    expect(runtime.writeCalls).toEqual([{ x: 1, y: 1, resourceType: RESOURCE_TYPE }]);
    expect(runtime.resources[5]).toBe(RESOURCE_TYPE);
  });

  it("rejects out-of-bounds plots and Civ7's no-resource sentinel before engine access", () => {
    const runtime = installResourceRuntime();
    const adapter = new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT);
    expect(
      adapter.placeResourceIntent({
        plotIndex: 12,
        resourceType: RESOURCE_TYPE,
      })
    ).toEqual({
      status: "rejected",
      plotIndex: 12,
      x: 0,
      y: 3,
      resourceType: RESOURCE_TYPE,
      reason: "out-of-bounds",
    });
    expect(adapter.placeResourceIntent({ plotIndex: 5, resourceType: NO_RESOURCE })).toEqual({
      status: "rejected",
      plotIndex: 5,
      x: 1,
      y: 1,
      resourceType: NO_RESOURCE,
      reason: "invalid-resource-type",
    });
    expect(runtime.feasibilityCalls).toEqual([]);
    expect(runtime.writeCalls).toEqual([]);
  });

  it("returns fail-hard mismatch evidence when the engine readback differs", () => {
    const runtime = installResourceRuntime(NO_RESOURCE);
    expect(
      new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT).placeResourceIntent({
        plotIndex: 6,
        resourceType: RESOURCE_TYPE,
      })
    ).toEqual({
      status: "mismatch",
      plotIndex: 6,
      x: 2,
      y: 1,
      resourceType: RESOURCE_TYPE,
      reason: "wrong-resource-type",
      observedResourceType: NO_RESOURCE,
    });
    expect(runtime.feasibilityCalls).toEqual([
      { x: 2, y: 1, resourceType: RESOURCE_TYPE, ignoreWeight: false },
    ]);
    expect(runtime.writeCalls).toEqual([{ x: 2, y: 1, resourceType: RESOURCE_TYPE }]);
  });
});

const TINY_MAP_SIZE = getCiv7StandardMapSizePreset("MAPSIZE_TINY");

beforeEach(() => {
  runOfficialDiscoveryGenerator = () => {};
});

function installDiscoveryRuntime(accept: (attemptIndex: number) => boolean): Readonly<{
  runtime: DiscoveryRuntime;
  originalAddDiscovery: AddDiscovery;
  calls: Array<{
    x: number;
    y: number;
    discoveryVisualType: number;
    discoveryActivationType: number;
  }>;
}> {
  const calls: Array<{
    x: number;
    y: number;
    discoveryVisualType: number;
    discoveryActivationType: number;
  }> = [];
  const originalAddDiscovery: AddDiscovery = (
    x,
    y,
    discoveryVisualType,
    discoveryActivationType
  ) => {
    const attemptIndex = calls.length;
    calls.push({ x, y, discoveryVisualType, discoveryActivationType });
    return accept(attemptIndex);
  };
  const runtime: DiscoveryRuntime = { addDiscovery: originalAddDiscovery };
  (globalThis as Record<string, unknown>).MapConstructibles = runtime;
  return { runtime, originalAddDiscovery, calls };
}

describe("Civ7Adapter official discovery generation", () => {
  it("delegates the admitted run and counts exact engine attempts and acceptances", () => {
    const { width, height } = TINY_MAP_SIZE.dimensions;
    const startPositions = [width + 3, 2 * width + 7];
    const polarMargin = 3;
    const generatorCalls: Array<{
      width: number;
      height: number;
      startPositions: readonly number[];
      polarMargin: number;
    }> = [];
    const runtime = installDiscoveryRuntime((attemptIndex) => attemptIndex !== 1);
    runOfficialDiscoveryGenerator = (
      generatorWidth,
      generatorHeight,
      generatorStartPositions,
      generatorPolarMargin
    ) => {
      generatorCalls.push({
        width: generatorWidth,
        height: generatorHeight,
        startPositions: [...generatorStartPositions],
        polarMargin: generatorPolarMargin,
      });
      runtime.runtime.addDiscovery?.(1, 2, 101, 201);
      runtime.runtime.addDiscovery?.(3, 4, 102, 202);
      runtime.runtime.addDiscovery?.(5, 6, 103, 203);
    };
    expect(
      new Civ7AdapterCtor(width, height).generateOfficialDiscoveries(startPositions, polarMargin)
    ).toEqual({ attemptedCount: 3, placedCount: 2 });
    expect(generatorCalls).toEqual([{ width, height, startPositions, polarMargin }]);
    expect(runtime.calls).toEqual([
      { x: 1, y: 2, discoveryVisualType: 101, discoveryActivationType: 201 },
      { x: 3, y: 4, discoveryVisualType: 102, discoveryActivationType: 202 },
      { x: 5, y: 6, discoveryVisualType: 103, discoveryActivationType: 203 },
    ]);
    expect(runtime.runtime.addDiscovery).toBe(runtime.originalAddDiscovery);
  });

  it("restores the engine function when official generation throws", () => {
    const { width, height } = TINY_MAP_SIZE.dimensions;
    const polarMargin = 2;
    const runtime = installDiscoveryRuntime(() => true);
    runOfficialDiscoveryGenerator = () => {
      throw new Error("provider exploded");
    };
    expect(() =>
      new Civ7AdapterCtor(width, height).generateOfficialDiscoveries([width + 1], polarMargin)
    ).toThrow(
      `Official discovery generation failed (width=${width}, height=${height}, startPositions=1, polarMargin=${polarMargin}): provider exploded`
    );
    expect(runtime.runtime.addDiscovery).toBe(runtime.originalAddDiscovery);
  });

  it("refuses generation when Civ7's discovery capability is unavailable", () => {
    const { width, height } = TINY_MAP_SIZE.dimensions;
    let generatorInvoked = false;
    runOfficialDiscoveryGenerator = () => {
      generatorInvoked = true;
    };
    (globalThis as Record<string, unknown>).MapConstructibles = {};
    expect(() => new Civ7AdapterCtor(width, height).generateOfficialDiscoveries([], 0)).toThrow(
      "MapConstructibles.addDiscovery is unavailable for official discovery generation"
    );
    expect(generatorInvoked).toBe(false);
  });
});

const NAVIGABLE_RIVER_TERRAIN = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_NAVIGABLE_RIVER;

function installRiverRuntime(
  getRiverType: ((x: number) => number) | undefined,
  isRiver: () => boolean,
  terrain: readonly number[] = [CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT]
): void {
  (globalThis as Record<string, unknown>).GameInfo = {
    Terrains: [
      {
        TerrainType: "TERRAIN_NAVIGABLE_RIVER",
        Index: NAVIGABLE_RIVER_TERRAIN,
      },
    ],
  };
  (globalThis as Record<string, unknown>).GameplayMap = {
    getTerrainType: (x: number) => terrain[x] ?? 0,
    ...(getRiverType ? { getRiverType } : {}),
    isRiver,
  };
}

describe("Civ7Adapter river projection readback", () => {
  it("keeps terrain materialization separate when navigable metadata API is absent", () => {
    const terrain = [
      NAVIGABLE_RIVER_TERRAIN,
      NAVIGABLE_RIVER_TERRAIN,
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT,
      NAVIGABLE_RIVER_TERRAIN,
    ];
    (globalThis as Record<string, unknown>).RiverTypes = {
      NO_RIVER: NO_RIVER_TYPE,
      RIVER_MINOR: RIVER_TYPE_MINOR,
      RIVER_NAVIGABLE: RIVER_TYPE_NAVIGABLE,
    };
    installRiverRuntime(
      () => NO_RIVER_TYPE,
      () => false,
      terrain
    );
    const adapter = new Civ7AdapterCtor(4, 1);
    const projection = adapter.readRiverProjection(4, 1, new Uint8Array([1, 1, 1, 0]));
    expect(adapter.isNavigableRiver(0, 0)).toBe(false);
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

  it("uses runtime or policy river metadata when the navigable API is absent", () => {
    (globalThis as Record<string, unknown>).RiverTypes = {
      NO_RIVER: NO_RIVER_TYPE,
      RIVER_MINOR: RIVER_TYPE_MINOR,
      RIVER_NAVIGABLE: RIVER_TYPE_NAVIGABLE,
    };
    installRiverRuntime(
      (x) => (x === 0 ? RIVER_TYPE_NAVIGABLE : RIVER_TYPE_MINOR),
      () => true
    );
    let adapter = new Civ7AdapterCtor(2, 1);
    expect(adapter.isNavigableRiver(0, 0)).toBe(true);
    expect(adapter.isNavigableRiver(1, 0)).toBe(false);
    let projection = adapter.readRiverProjection(2, 1, new Uint8Array([0, 0]));
    expect(Array.from(projection.engineMinorRiverMask)).toEqual([0, 1]);
    expect(projection.engineMinorRiverTileCount).toBe(1);
    delete (globalThis as Record<string, unknown>).RiverTypes;
    adapter = new Civ7AdapterCtor(2, 1);
    projection = adapter.readRiverProjection(2, 1, new Uint8Array([0, 0]));
    expect(Array.from(projection.engineNavigableRiverMask)).toEqual([1, 0]);
    expect(Array.from(projection.engineMinorRiverMask)).toEqual([0, 1]);
  });

  it("marks minor-river metadata unsupported when the native river-type contract is absent", () => {
    installRiverRuntime(undefined, () => false);
    const projection = new Civ7AdapterCtor(1, 1).readRiverProjection(1, 1, new Uint8Array([0]));
    expect(projection.minorRiverStampingSupported).toBe(false);
    expect(projection.minorRiverUnsupportedReason).toContain("unavailable");
  });
});

describe("Civ7 runtime warnings", () => {
  it("uses warn when provided and falls back to tagged log output", () => {
    const adapter = new Civ7AdapterCtor(1, 1);
    const hostConsole = console as unknown as {
      warn?: (message: string) => void;
      log: (message: string) => void;
    };
    const originalWarn = hostConsole.warn;
    const originalLog = hostConsole.log;
    const warnings: string[] = [];
    const logs: string[] = [];
    try {
      hostConsole.warn = (message) => warnings.push(message);
      hostConsole.log = (message) => logs.push(message);
      adapter.emitRuntimeWarning("full console");
      expect(warnings).toEqual(["full console"]);
      expect(logs).toEqual([]);
      hostConsole.warn = undefined;
      adapter.emitRuntimeWarning("Civ7 isolate");
      expect(logs).toEqual(["[warn] Civ7 isolate"]);
    } finally {
      hostConsole.warn = originalWarn;
      hostConsole.log = originalLog;
    }
  });
});

describe("Civ7 resource age policy query", () => {
  it("hashes the symbolic age and preserves true and false engine answers", () => {
    const calls: Array<[number, number]> = [];
    const runtime = {
      Database: {
        makeHash: (ageType: string) => {
          expect(ageType).toBe("AGE_ANTIQUITY");
          return 731;
        },
      },
      ResourceBuilder: {
        isResourceRequiredForAge: (resourceTypeId: number, ageHash: number) => {
          calls.push([resourceTypeId, ageHash]);
          return resourceTypeId === 11;
        },
      },
    };
    expect(queryCiv7ResourceRequirementForAge(runtime, 11, "AGE_ANTIQUITY")).toBe(true);
    expect(queryCiv7ResourceRequirementForAge(runtime, 12, "AGE_ANTIQUITY")).toBe(false);
    expect(calls).toEqual([
      [11, 731],
      [12, 731],
    ]);
  });

  it("returns null for unavailable surfaces and propagates malformed or failed engine calls", () => {
    expect(queryCiv7ResourceRequirementForAge({}, 11, "AGE_ANTIQUITY")).toBeNull();
    expect(
      queryCiv7ResourceRequirementForAge({ Database: { makeHash: () => 731 } }, 11, "AGE_ANTIQUITY")
    ).toBeNull();
    expect(
      queryCiv7ResourceRequirementForAge(
        { ResourceBuilder: { isResourceRequiredForAge: () => true } },
        11,
        "AGE_ANTIQUITY"
      )
    ).toBeNull();
    expect(() =>
      queryCiv7ResourceRequirementForAge(
        {
          Database: { makeHash: () => 731 },
          ResourceBuilder: { isResourceRequiredForAge: () => "true" },
        },
        11,
        "AGE_ANTIQUITY"
      )
    ).toThrow(TypeError);
    const hashError = new Error("hash failed");
    expect(() =>
      queryCiv7ResourceRequirementForAge(
        {
          Database: {
            makeHash: () => {
              throw hashError;
            },
          },
          ResourceBuilder: { isResourceRequiredForAge: () => true },
        },
        11,
        "AGE_ANTIQUITY"
      )
    ).toThrow(hashError);
    const policyError = new Error("policy failed");
    expect(() =>
      queryCiv7ResourceRequirementForAge(
        {
          Database: { makeHash: () => 731 },
          ResourceBuilder: {
            isResourceRequiredForAge: () => {
              throw policyError;
            },
          },
        },
        11,
        "AGE_ANTIQUITY"
      )
    ).toThrow(policyError);
  });
});
