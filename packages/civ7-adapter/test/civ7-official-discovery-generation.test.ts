import { afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

import { getCiv7StandardMapSizePreset } from "../src/map-metadata.js";

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

type DiscoveryRuntime = {
  addDiscovery?: AddDiscovery;
};

const TINY_MAP_SIZE = getCiv7StandardMapSizePreset("MAPSIZE_TINY");

let runOfficialDiscoveryGenerator: OfficialDiscoveryGenerator = () => {};
let Civ7AdapterCtor: typeof import("../src/civ7-adapter.js").Civ7Adapter;

mock.module("/base-standard/maps/discovery-generator.js", () => ({
  generateDiscoveries: (
    width: number,
    height: number,
    startPositions: readonly number[],
    polarMargin: number
  ) => runOfficialDiscoveryGenerator(width, height, startPositions, polarMargin),
}));

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor } = await import("../src/civ7-adapter.js"));
});

beforeEach(() => {
  runOfficialDiscoveryGenerator = () => {};
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).MapConstructibles;
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
    const adapter = new Civ7AdapterCtor(width, height);

    expect(adapter.generateOfficialDiscoveries(startPositions, polarMargin)).toEqual({
      attemptedCount: 3,
      placedCount: 2,
    });
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
    const startPositions = [width + 1];
    const polarMargin = 2;
    const runtime = installDiscoveryRuntime(() => true);
    runOfficialDiscoveryGenerator = () => {
      throw new Error("provider exploded");
    };
    const adapter = new Civ7AdapterCtor(width, height);

    expect(() => adapter.generateOfficialDiscoveries(startPositions, polarMargin)).toThrow(
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
    const adapter = new Civ7AdapterCtor(width, height);

    expect(() => adapter.generateOfficialDiscoveries([], 0)).toThrow(
      "MapConstructibles.addDiscovery is unavailable for official discovery generation"
    );
    expect(generatorInvoked).toBe(false);
  });
});
