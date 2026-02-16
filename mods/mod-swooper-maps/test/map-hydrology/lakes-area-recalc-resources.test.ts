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

  override generateLakes(width: number, height: number, tilesPerLake: number): void {
    this.callOrder.push("generateLakes");
    super.generateLakes(width, height, tilesPerLake);
    this.setTerrainType(1, 1, COAST_TERRAIN);
    this.lakeNeedsAreaRefresh = true;
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

  override canHaveResource(x: number, y: number, resourceType: number): boolean {
    return this.isWater(x, y) && super.canHaveResource(x, y, resourceType);
  }
}

describe("map-hydrology lakes area/water ordering", () => {
  it("keeps lake tiles water-filled across rivers + placement and uses official resource generation", () => {
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
      officialResourcesPlacedCount: 1,
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

    lakes.run(context as any, { tilesPerLakeMultiplier: 1 }, {} as any, buildTestDeps(lakes));
    plotRivers.run(context as any, { minLength: 5, maxLength: 15 }, {} as any, buildTestDeps(plotRivers));

    expect(adapter.callOrder.slice(0, 3)).toEqual(["storeWaterData", "generateLakes", "recalculateAreas"]);
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
    const resources = {
      width,
      height,
      candidateResourceTypes: [3],
      targetCount: 1,
      plannedCount: 1,
      placements: [
        {
          plotIndex: 1 + width,
          preferredResourceType: 3,
          preferredTypeOffset: 0,
          priority: 1,
        },
      ],
    };

    const outputs = applyPlacementPlan({
      context,
      starts,
      wonders,
      naturalWonderPlan: {
        width,
        height,
        wondersCount: 0,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      },
      discoveryPlan: {
        width,
        height,
        candidateDiscoveries: [],
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      },
      floodplains,
      resources,
      landmassRegionSlotByTile: { slotByTile: new Uint8Array(size).fill(1) },
      publishOutputs: (outputs) => outputs,
    });

    expect(adapter.calls.generateOfficialResources).toEqual([
      { width, height, minMarineResourceTypesOverride: undefined },
    ]);
    expect(adapter.calls.setResourceType.length).toBe(0);
    expect(outputs.resourcesCount).toBe(1);
    expect(adapter.isWater(1, 1)).toBe(true);
  });
});
