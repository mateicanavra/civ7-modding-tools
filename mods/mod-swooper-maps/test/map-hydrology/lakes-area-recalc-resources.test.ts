import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import placement from "../../src/domain/placement/ops.js";
import { getStandardRuntime } from "../../src/recipes/standard/runtime.js";
import lakes from "../../src/recipes/standard/stages/map-hydrology/steps/lakes.js";
import plotRivers from "../../src/recipes/standard/stages/map-hydrology/steps/plotRivers.js";
import { applyPlacementPlan } from "../../src/recipes/standard/stages/placement/steps/placement/apply.js";
import { buildTestDeps } from "../support/step-deps.js";

class AreaSensitiveLakeAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  private lakeNeedsAreaRefresh = false;
  readonly callOrder: string[] = [];
  resourcesPlaced = 0;

  constructor(config: ConstructorParameters<typeof MockAdapter>[0]) {
    super(config);
    this.cachedWater = new Uint8Array(Math.max(0, this.width * this.height));
  }

  private idx2(x: number, y: number): number {
    return y * this.width + x;
  }

  private recomputeCachedWaterFromTerrain(): void {
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
    // Simulate engine cache-backed water reads.
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override setTerrainType(x: number, y: number, terrainType: number): void {
    this.callOrder.push("setTerrainType");
    super.setTerrainType(x, y, terrainType);
    if (x === 1 && y === 1 && terrainType === COAST_TERRAIN) {
      this.lakeNeedsAreaRefresh = true;
    }
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
    this.lakeNeedsAreaRefresh = false;
  }

  override validateAndFixTerrain(): void {
    this.callOrder.push("validateAndFixTerrain");
    // Simulate the engine normalizing stale post-lake terrain if areas were not rebuilt.
    if (this.lakeNeedsAreaRefresh) {
      this.setTerrainType(1, 1, FLAT_TERRAIN);
    }
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");
    this.recomputeCachedWaterFromTerrain();
  }

  override modelRivers(): void {
    this.callOrder.push("modelRivers");
  }

  override defineNamedRivers(): void {
    this.callOrder.push("defineNamedRivers");
  }

  override generateResources(width: number, height: number): void {
    this.callOrder.push("generateResources");
    let waterTiles = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.isWater(x, y)) waterTiles += 1;
      }
    }
    this.resourcesPlaced = waterTiles;
    if (waterTiles === 0) {
      throw new Error("No water-eligible plots available for resources.");
    }
  }
}

describe("map-hydrology lakes area/water ordering", () => {
  it("keeps lake tiles water-filled across rivers + placement and preserves resource generation", () => {
    const width = 4;
    const height = 4;
    const seed = 1234;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 0,
      LakeGenerationFrequency: 5,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new AreaSensitiveLakeAdapter({
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

    lakes.run(context as any, {}, {} as any, buildTestDeps(lakes));
    plotRivers.run(context as any, { minLength: 5, maxLength: 15 }, {} as any, buildTestDeps(plotRivers));

    expect(adapter.callOrder.slice(0, 3)).toEqual(["setTerrainType", "recalculateAreas", "storeWaterData"]);
    expect(adapter.isWater(1, 1)).toBe(true);

    const runtime = getStandardRuntime(context);
    const starts = placement.ops.planStarts.run(
      {
        baseStarts: {
          playersLandmass1: runtime.playersLandmass1,
          playersLandmass2: runtime.playersLandmass2,
          startSectorRows: runtime.startSectorRows,
          startSectorCols: runtime.startSectorCols,
          startSectors: runtime.startSectors,
        },
      },
      placement.ops.planStarts.defaultConfig
    );
    const wonders = placement.ops.planWonders.run(
      { mapInfo: runtime.mapInfo },
      placement.ops.planWonders.defaultConfig
    );
    const floodplains = placement.ops.planFloodplains.run({}, placement.ops.planFloodplains.defaultConfig);

    applyPlacementPlan({
      context,
      starts,
      wonders,
      floodplains,
      landmassRegionSlotByTile: { slotByTile: new Uint8Array(size).fill(1) },
      publishOutputs: (outputs) => outputs,
    });

    expect(adapter.resourcesPlaced).toBeGreaterThan(0);
    expect(adapter.isWater(1, 1)).toBe(true);
  });
});
