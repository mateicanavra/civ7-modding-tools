import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import { NO_RESOURCE } from "@civ7/map-policy";

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

const SYNTHETIC_WIDTH = 4;
const SYNTHETIC_HEIGHT = 3;
const RESOURCE_TYPE = 7;

let Civ7AdapterCtor: typeof import("../src/civ7-adapter.js").Civ7Adapter;

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor } = await import("../src/civ7-adapter.js"));
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).GameplayMap;
  delete (globalThis as Record<string, unknown>).ResourceBuilder;
});

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
  it("derives exact engine coordinates from adapter-owned dimensions and accepts readback", () => {
    const runtime = installResourceRuntime();
    const adapter = new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT);

    const outcome = adapter.placeResourceIntent({
      plotIndex: 5,
      resourceType: RESOURCE_TYPE,
    });

    expect(outcome).toEqual({
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

  it("rejects the first plot beyond adapter-owned bounds without consulting the engine", () => {
    const runtime = installResourceRuntime();
    const adapter = new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT);

    const outcome = adapter.placeResourceIntent({
      plotIndex: SYNTHETIC_WIDTH * SYNTHETIC_HEIGHT,
      resourceType: RESOURCE_TYPE,
    });

    expect(outcome).toEqual({
      status: "rejected",
      plotIndex: 12,
      x: 0,
      y: 3,
      resourceType: RESOURCE_TYPE,
      reason: "out-of-bounds",
    });
    expect(runtime.feasibilityCalls).toEqual([]);
    expect(runtime.writeCalls).toEqual([]);
  });

  it("rejects Civ7's no-resource sentinel without consulting the engine", () => {
    const runtime = installResourceRuntime();
    const adapter = new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT);

    const outcome = adapter.placeResourceIntent({
      plotIndex: 5,
      resourceType: NO_RESOURCE,
    });

    expect(outcome).toEqual({
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

  it("returns fail-hard mismatch evidence when engine readback reports the wrong resource", () => {
    const runtime = installResourceRuntime(NO_RESOURCE);
    const adapter = new Civ7AdapterCtor(SYNTHETIC_WIDTH, SYNTHETIC_HEIGHT);

    const outcome = adapter.placeResourceIntent({
      plotIndex: 6,
      resourceType: RESOURCE_TYPE,
    });

    expect(outcome).toEqual({
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
