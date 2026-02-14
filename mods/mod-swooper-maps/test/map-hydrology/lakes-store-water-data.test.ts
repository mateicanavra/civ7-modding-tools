import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import lakes from "../../src/recipes/standard/stages/map-hydrology/steps/lakes.js";
import { buildTestDeps } from "../support/step-deps.js";

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
    // Simulate Civ engine behavior: water can be backed by cached water tables,
    // not recomputed automatically from terrain edits.
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override setTerrainType(x: number, y: number, terrainType: number): void {
    if (x === 1 && y === 1 && terrainType === COAST_TERRAIN) {
      this.callOrder.push("setTerrainType");
    }
    super.setTerrainType(x, y, terrainType);
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
    super.recalculateAreas();
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");

    // Recompute cached water tables from plotted terrain.
    const coast = this.getTerrainTypeIndex("TERRAIN_COAST");
    const ocean = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.getTerrainType(x, y) | 0;
        this.cachedWater[this.idx2(x, y)] = t === coast || t === ocean ? 1 : 0;
      }
    }
  }
}

describe("map-hydrology/lakes", () => {
  it("calls storeWaterData after deterministic lake stamping so cached water tables reflect new lakes", () => {
    const width = 4;
    const height = 3;
    const seed = 1234;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      LakeGenerationFrequency: 5,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    const size = width * height;
    context.artifacts.set("artifact:morphology.topography", {
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask: new Uint8Array(size).fill(1),
      bathymetry: new Int16Array(size),
    });
    context.artifacts.set("artifact:hydrology.hydrography", {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });
    const lakeMask = new Uint8Array(size);
    lakeMask[1 + width] = 1;
    context.artifacts.set("artifact:hydrology.lakePlan", {
      width,
      height,
      lakeMask,
      plannedLakeTileCount: 1,
      sinkLakeCount: 1,
    });

    // Before running the step: cached water tables say "land".
    expect(adapter.isWater(1, 1)).toBe(false);

    lakes.run(context as any, {}, {} as any, buildTestDeps(lakes));

    expect(adapter.callOrder.slice(-3)).toEqual(["setTerrainType", "recalculateAreas", "storeWaterData"]);
    // After storeWaterData: cached water tables reflect the new lake tile.
    expect(adapter.isWater(1, 1)).toBe(true);
  });
});
