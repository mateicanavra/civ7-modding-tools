import { describe, expect, it } from "bun:test";

import { MockAdapter, type LakeProjectionResult } from "@civ7/adapter";
import { FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import lakes from "../../src/recipes/standard/stages/map-hydrology/steps/lakes.js";
import { buildTestDeps } from "../support/step-deps.js";

type TestContext = ReturnType<typeof createExtendedMapContext>;

/**
 * Cache-backed adapter double.
 *
 * The real engine can answer water queries from cached topology, so this double
 * makes lake stamping fail unless the adapter boundary refreshes water data
 * after terrain mutation.
 */
class CachedWaterAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  readonly callOrder: string[] = [];

  constructor(config: ConstructorParameters<typeof MockAdapter>[0]) {
    super(config);
    this.cachedWater = new Uint8Array(Math.max(0, this.width * this.height));
  }

  private idx2(x: number, y: number): number {
    return y * this.width + x;
  }

  override isWater(x: number, y: number): boolean {
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    this.callOrder.push("stampLakes");
    return super.stampLakes(width, height, lakeMask);
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");

    const coast = this.getTerrainTypeIndex("TERRAIN_COAST");
    const ocean = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const terrain = this.getTerrainType(x, y) | 0;
        this.cachedWater[this.idx2(x, y)] = terrain === coast || terrain === ocean ? 1 : 0;
      }
    }
  }
}

/**
 * Readback-rejecting adapter double.
 *
 * This keeps the test focused on the projection contract: `map-hydrology/lakes`
 * records rejections as diagnostics and does not turn engine disagreement into
 * Hydrology truth or a runtime throw.
 */
class RejectingLakeAdapter extends MockAdapter {
  override stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    this.calls.stampLakes.push({ width, height, lakeMask });
    const size = width * height;
    const rejectedLakeMask = new Uint8Array(size);
    const nonLakeMask = new Uint8Array(size);
    let plannedLakeTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakeMask[i] !== 1) continue;
      rejectedLakeMask[i] = 1;
      nonLakeMask[i] = 1;
      plannedLakeTileCount += 1;
    }
    return {
      width,
      height,
      plannedLakeMask: lakeMask,
      stampedLakeMask: new Uint8Array(size),
      rejectedLakeMask,
      engineTerrain: new Int32Array(size),
      engineWaterMask: new Uint8Array(size),
      engineLakeMask: new Uint8Array(size),
      engineAreaId: new Int32Array(size),
      engineElevation: new Int16Array(size),
      terrainMismatchMask: new Uint8Array(size),
      nonWaterMask: rejectedLakeMask,
      nonLakeMask,
      plannedLakeTileCount,
      stampedLakeTileCount: 0,
      rejectedLakeTileCount: plannedLakeTileCount,
      terrainMismatchTileCount: 0,
      nonWaterTileCount: plannedLakeTileCount,
      nonLakeTileCount: plannedLakeTileCount,
    };
  }
}

function createContext(adapter: MockAdapter, width: number, height: number, seed: number): TestContext {
  return createExtendedMapContext(
    { width, height },
    adapter,
    {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }
  );
}

function seedLakePlan(context: TestContext, lakeMask: Uint8Array): void {
  const { width, height } = context.dimensions;
  const size = width * height;
  context.artifacts.set("artifact:morphology.topography", {
    elevation: new Int16Array(size),
    seaLevel: 0,
    landMask: new Uint8Array(size).fill(1),
    bathymetry: new Int16Array(size),
  });
  context.artifacts.set("artifact:hydrology.lakePlan", {
    width,
    height,
    lakeMask,
    plannedLakeTileCount: lakeMask.reduce((count, value) => count + (value === 1 ? 1 : 0), 0),
    sinkLakeCount: lakeMask.reduce((count, value) => count + (value === 1 ? 1 : 0), 0),
  });
}

describe("map-hydrology/lakes", () => {
  it("refreshes engine water caches after stamping planned lakes", () => {
    const width = 4;
    const height = 3;
    const seed = 1234;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 },
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    const context = createContext(adapter, width, height, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[1 + width] = 1;
    seedLakePlan(context, lakeMask);

    expect(adapter.isWater(1, 1)).toBe(false);

    lakes.run(context as any, { projectionReadback: true }, {} as any, buildTestDeps(lakes));

    expect(adapter.callOrder.slice(-3)).toEqual([
      "stampLakes",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.isWater(1, 1)).toBe(true);

    const projection = context.artifacts.get("artifact:map.hydrology.engineProjectionLakes") as
      | { nonLakeTileCount?: number; terrainMismatchTileCount?: number }
      | undefined;
    expect(projection?.nonLakeTileCount ?? -1).toBe(0);
    expect(projection?.terrainMismatchTileCount ?? -1).toBe(0);
  });

  it("records projection rejection as diagnostics without throwing", () => {
    const width = 4;
    const height = 3;
    const seed = 4321;
    const adapter = new RejectingLakeAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 },
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    const context = createContext(adapter, width, height, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[1 + width] = 1;
    seedLakePlan(context, lakeMask);

    expect(() =>
      lakes.run(context as any, { projectionReadback: true }, {} as any, buildTestDeps(lakes))
    ).not.toThrow();

    const projection = context.artifacts.get("artifact:map.hydrology.engineProjectionLakes") as
      | { sinkMismatchCount: number; nonLakeTileCount?: number; terrainMismatchTileCount?: number }
      | undefined;
    expect(projection).toBeDefined();
    expect(projection?.sinkMismatchCount ?? 0).toBe(1);
    expect(projection?.nonLakeTileCount ?? 0).toBe(1);
    expect(projection?.terrainMismatchTileCount ?? 0).toBe(0);
  });

  it("stamps the Hydrology lake plan directly instead of calling engine lake generation", () => {
    const width = 6;
    const height = 5;
    const seed = 9876;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: {
        GridWidth: width,
        GridHeight: height,
        MinLatitude: -60,
        MaxLatitude: 60,
        LakeGenerationFrequency: 25,
      },
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    const context = createContext(adapter, width, height, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[2 + width] = 1;
    lakeMask[3 + width] = 1;
    seedLakePlan(context, lakeMask);

    lakes.run(context as any, { projectionReadback: false }, {} as any, buildTestDeps(lakes));

    expect(adapter.calls.generateLakes).toEqual([]);
    expect(adapter.calls.stampLakes.at(-1)?.lakeMask).toBe(lakeMask);
  });
});
