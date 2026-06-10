import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import {
  FLAT_TERRAIN,
  NAVIGABLE_RIVER_TERRAIN,
  createExtendedMapContext,
} from "@swooper/mapgen-core";
import { RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { RIVER_CLASS_MAJOR, RIVER_CLASS_MINOR } from "../../src/domain/hydrology/index.js";
import selectNavigableRiverTerrain from "../../src/domain/hydrology/ops/select-navigable-river-terrain/index.js";
import plotRivers from "../../src/recipes/standard/stages/map-rivers/steps/plotRivers.js";
import { mapRiversArtifacts } from "../../src/recipes/standard/stages/map-rivers/artifacts.js";
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

  override validateAndFixTerrain(): void {
    this.callOrder.push("validateAndFixTerrain");
  }

  override modelRivers(minLength: number, maxLength: number, navigableTerrain: number): void {
    this.callOrder.push("modelRivers");
    super.modelRivers(minLength, maxLength, navigableTerrain);
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

describe("map-rivers/plot-rivers", () => {
  it("stamps MapGen-projected navigable rivers and refreshes downstream caches", () => {
    expect(mapRiversArtifacts.projectedNavigableRivers.id).toBe(
      "artifact:map.rivers.projectedNavigableRivers"
    );
    expect(mapRiversArtifacts.engineProjectionRivers.id).toBe("artifact:map.rivers.engineProjectionRivers");

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
    const discharge = new Float32Array(size);
    const riverClass = new Uint8Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    for (let x = 0; x < width; x++) {
      const index = x;
      discharge[index] = x + 1;
      riverClass[index] = RIVER_CLASS_MAJOR;
      flowDir[index] = x < width - 1 ? x + 1 : -1;
    }
    for (let x = 0; x < width; x++) {
      const index = width + x;
      discharge[index] = 100 + x;
      riverClass[index] = RIVER_CLASS_MINOR;
      flowDir[index] = x < width - 1 ? width + x + 1 : -1;
    }

    context.artifacts.set("artifact:hydrology.hydrography", {
      runoff: new Float32Array(size),
      discharge,
      riverClass,
      flowDir,
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });
    context.artifacts.set("artifact:hydrology.riverNetworkMetrics", {
      upstreamArea: Int32Array.from({ length: size }, (_value, index) => (index < width ? index + 1 : 1)),
      streamOrderProxy: new Uint8Array(size),
      mouthType: Uint8Array.from({ length: size }, (_value, index) => (index < width ? 1 : 0)),
      slopeClass: new Uint8Array(size),
      flowPermanenceProxy: Uint8Array.from(
        { length: size },
        (_value, index) => (index < width ? 3 : index < width * 2 ? 2 : 0)
      ),
    });
    context.artifacts.set("artifact:hydrology.lakePlan", {
      width,
      height,
      lakeMask: new Uint8Array(size),
      plannedLakeTileCount: 0,
      sinkLakeCount: 0,
    });

    expect(adapter.getTerrainType(0, 0)).toBe(FLAT_TERRAIN);

    plotRivers.run(
      context as any,
      {
        selectNavigableRiverTerrain: {
          strategy: "default",
          config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
        },
      },
      { selectNavigableRiverTerrain: selectNavigableRiverTerrain.run } as any,
      buildTestDeps(plotRivers)
    );

    expect(adapter.callOrder).toEqual([
      "modelRivers",
      "validateAndFixTerrain",
      "defineNamedRivers",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.getTerrainType(0, 0)).toBe(NAVIGABLE_RIVER_TERRAIN);
    expect(adapter.getTerrainType(4, 0)).toBe(NAVIGABLE_RIVER_TERRAIN);
    expect(adapter.getTerrainType(0, 1)).toBe(FLAT_TERRAIN);

    const projected = context.artifacts.get(mapRiversArtifacts.projectedNavigableRivers.id) as
      | {
          riverMask?: Uint8Array;
          plannedMinorRiverMask?: Uint8Array;
          plannedMajorRiverMask?: Uint8Array;
          plannedMinorRiverTileCount?: number;
          plannedMajorRiverTileCount?: number;
          selectedChainLengths?: Uint16Array;
          longestSelectedChainLength?: number;
          meanSelectedChainLength?: number;
          selectedEligibleMajorTileFraction?: number;
          majorDurableTileCount?: number;
          majorPerennialTileCount?: number;
          projectionSignalStatus?: string;
          projectionSignalReason?: string;
        }
      | undefined;
    const readback = context.artifacts.get(mapRiversArtifacts.engineProjectionRivers.id) as
      | {
          riverMask?: Uint8Array;
          engineRiverType?: Int32Array;
          engineNavigableRiverMask?: Uint8Array;
          engineRiverTileCount?: number;
          engineMinorRiverTileCount?: number;
          terrainNavigableRiverTileCount?: number;
          minorRiverStampingSupported?: boolean;
          minorRiverUnsupportedReason?: string;
        }
      | undefined;
    expect(projected?.riverMask?.[0]).toBe(1);
    expect(projected?.riverMask?.[width]).toBe(0);
    expect(projected?.plannedMajorRiverMask?.[0]).toBe(1);
    expect(projected?.plannedMinorRiverMask?.[width]).toBe(1);
    expect(projected?.plannedMajorRiverTileCount).toBe(5);
    expect(projected?.plannedMinorRiverTileCount).toBe(5);
    expect(Array.from(projected?.selectedChainLengths ?? [])).toEqual([5]);
    expect(projected?.longestSelectedChainLength).toBe(5);
    expect(projected?.meanSelectedChainLength).toBe(5);
    expect(projected?.selectedEligibleMajorTileFraction).toBe(1);
    expect(projected?.majorDurableTileCount).toBe(5);
    expect(projected?.majorPerennialTileCount).toBe(5);
    expect(projected?.projectionSignalStatus).toBe("normal-signal");
    expect(projected?.projectionSignalReason).toContain("normal Earthlike");
    expect(readback?.riverMask?.[0]).toBe(1);
    expect(readback?.riverMask?.[width]).toBe(0);
    expect(readback?.terrainNavigableRiverMask?.[0]).toBe(1);
    expect(readback?.engineNavigableRiverMask?.[0]).toBe(1);
    expect(readback?.engineRiverType?.[0]).toBe(RIVER_TYPE_NAVIGABLE);
    expect(readback?.terrainNavigableRiverTileCount).toBe(5);
    expect(readback?.engineRiverTileCount).toBe(5);
    expect(readback?.engineNavigableRiverTileCount).toBe(5);
    expect(readback?.engineMinorRiverTileCount).toBe(0);
    expect(readback?.minorRiverStampingSupported).toBe(true);
    expect(readback?.minorRiverUnsupportedReason).toContain("engineMinorRiverMask");
  });
});
