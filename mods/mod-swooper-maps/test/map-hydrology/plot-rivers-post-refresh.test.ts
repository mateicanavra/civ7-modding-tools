import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import plotRivers from "../../src/recipes/standard/stages/map-hydrology/steps/plotRivers.js";
import { buildTestDeps } from "../support/step-deps.js";

class RiverCacheRefreshAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  readonly callOrder: string[] = [];

  constructor(config: ConstructorParameters<typeof MockAdapter>[0]) {
    super(config);
    this.cachedWater = new Uint8Array(Math.max(0, this.width * this.height));
  }

  private idx2(x: number, y: number): number {
    return y * this.width + x;
  }

  private refreshCachedWaterFromTerrain(): void {
    const coast = this.getTerrainTypeIndex("TERRAIN_COAST");
    const ocean = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.getTerrainType(x, y) | 0;
        this.cachedWater[this.idx2(x, y)] = t === coast || t === ocean ? 1 : 0;
      }
    }
  }

  override isWater(x: number, y: number): boolean {
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override modelRivers(): void {
    this.callOrder.push("modelRivers");
    // Simulate river modeling mutating terrain in a way that requires cache refresh.
    this.setTerrainType(2, 1, COAST_TERRAIN);
  }

  override validateAndFixTerrain(): void {
    this.callOrder.push("validateAndFixTerrain");
  }

  override defineNamedRivers(): void {
    this.callOrder.push("defineNamedRivers");
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");
    this.refreshCachedWaterFromTerrain();
  }
}

describe("map-hydrology/plot-rivers", () => {
  it("rebuilds area/water caches after rivers so downstream checks read current topology", () => {
    const width = 5;
    const height = 4;
    const seed = 9876;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new RiverCacheRefreshAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    const size = width * height;
    context.artifacts.set("artifact:hydrology.hydrography", {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });

    expect(adapter.isWater(2, 1)).toBe(false);

    plotRivers.run(context as any, { minLength: 5, maxLength: 15 }, {} as any, buildTestDeps(plotRivers));

    expect(adapter.callOrder).toEqual([
      "modelRivers",
      "validateAndFixTerrain",
      "defineNamedRivers",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.isWater(2, 1)).toBe(true);
  });
});

