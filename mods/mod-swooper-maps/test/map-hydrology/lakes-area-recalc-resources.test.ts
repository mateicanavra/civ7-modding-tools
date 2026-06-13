import { describe, expect, it } from "bun:test";

import { type LakeProjectionResult, MockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, FLAT_TERRAIN } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";
import { standardConfig } from "../support/standard-config.js";

/**
 * Area-sensitive adapter double.
 *
 * Civ7 resource feasibility depends on refreshed area/water caches after lake
 * and river terrain edits. This double makes that ordering observable through
 * the public recipe run instead of seeding step artifacts or invoking placement
 * internals directly.
 */
class AreaSensitiveLakeAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  private cacheBackedWaterReads = false;
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
        const terrain = this.getTerrainType(x, y) | 0;
        this.cachedWater[this.idx2(x, y)] = terrain === coast || terrain === ocean ? 1 : 0;
      }
    }
  }

  override isWater(x: number, y: number): boolean {
    // Simulate engine cache-backed water reads; cache freshness is the contract
    // this regression protects.
    if (!this.cacheBackedWaterReads) return super.isWater(x, y);
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    this.callOrder.push("stampLakes");
    this.cacheBackedWaterReads = true;
    this.lakeNeedsAreaRefresh = true;
    return super.stampLakes(width, height, lakeMask);
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
    this.lakeNeedsAreaRefresh = false;
  }

  override validateAndFixTerrain(): void {
    this.callOrder.push("validateAndFixTerrain");
    // If lake stamping did not refresh areas before later validation, model the
    // kind of stale-cache normalization that previously dried projected lakes.
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

  override placeResourceIntent(
    width: number,
    height: number,
    intent: Parameters<MockAdapter["placeResourceIntent"]>[2]
  ): ReturnType<MockAdapter["placeResourceIntent"]> {
    this.callOrder.push("placeResourceIntent");
    return super.placeResourceIntent(width, height, intent);
  }
}

describe("map-hydrology lakes area/water ordering", () => {
  it("refreshes water caches before recipe-level typed resource materialization", () => {
    const width = 20;
    const height = 12;
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

    initializeStandardRuntime(context, {
      mapInfo,
      logPrefix: "[test]",
      storyEnabled: true,
    });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const firstLakeStamp = adapter.callOrder.indexOf("stampLakes");
    const firstAreaRefreshAfterLakes = adapter.callOrder.findIndex(
      (call, index) => index > firstLakeStamp && call === "recalculateAreas"
    );
    const firstWaterRefreshAfterLakes = adapter.callOrder.findIndex(
      (call, index) => index > firstAreaRefreshAfterLakes && call === "storeWaterData"
    );
    const firstResourceIntent = adapter.callOrder.indexOf("placeResourceIntent");
    const resourceOutcomes = context.artifacts.get(
      placementArtifacts.resourcePlacementOutcomes.id
    ) as { summary?: { plannedCount?: number } } | undefined;

    expect(firstLakeStamp).toBeGreaterThanOrEqual(0);
    expect(firstAreaRefreshAfterLakes).toBeGreaterThan(firstLakeStamp);
    expect(firstWaterRefreshAfterLakes).toBeGreaterThan(firstAreaRefreshAfterLakes);
    expect(firstResourceIntent).toBeGreaterThan(firstWaterRefreshAfterLakes);
    expect(resourceOutcomes?.summary?.plannedCount ?? 0).toBeGreaterThan(0);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
  });
});
