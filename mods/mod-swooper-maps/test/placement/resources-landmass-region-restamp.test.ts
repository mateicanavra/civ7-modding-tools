import { describe, expect, it } from "bun:test";

import { MockAdapter, type MapInfo } from "@civ7/adapter";
import { FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";

class RegionSensitiveResourceAdapter extends MockAdapter {
  readonly callOrder: string[] = [];

  override setLandmassRegionId(x: number, y: number, regionId: number): void {
    this.callOrder.push("setLandmassRegionId");
    super.setLandmassRegionId(x, y, regionId);
  }

  override validateAndFixTerrain(): void {
    // Placement restamps region ids after terrain validation because Civ7
    // normalization can clear projection-only region metadata.
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        super.setLandmassRegionId(x, y, this.getLandmassId("NONE"));
      }
    }
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

class RestampFailingAdapter extends RegionSensitiveResourceAdapter {
  override setLandmassRegionId(x: number, y: number, regionId: number): void {
    void x;
    void y;
    void regionId;
    throw new Error("forced restamp failure");
  }
}

function runRecipeWithAdapter(adapter: MockAdapter, width: number, height: number, seed: number) {
  const mapInfo: MapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 1,
    PlayersLandmass2: 1,
    StartSectorRows: 1,
    StartSectorCols: 1,
    NumNaturalWonders: 0,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: mapInfo.MaxLatitude ?? 60,
      bottomLatitude: mapInfo.MinLatitude ?? -60,
    },
  };
  const context = createExtendedMapContext({ width, height }, adapter, env);

  initializeStandardRuntime(context, {
    mapInfo,
    logPrefix: "[test]",
    storyEnabled: true,
  });
  standardRecipe.run(context, env, realismEarthlikeConfig, { log: () => {} });

  return context;
}

describe("placement resources landmass-region restamp", () => {
  it("re-stamps landmass regions before typed resource materialization", () => {
    const width = 20;
    const height = 12;
    const seed = 4242;
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
    };

    const adapter = new RegionSensitiveResourceAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });

    const context = runRecipeWithAdapter(adapter, width, height, seed);

    const firstRestamp = adapter.callOrder.indexOf("setLandmassRegionId");
    const firstResourceIntent = adapter.callOrder.indexOf("placeResourceIntent");
    const resourceOutcomes = context.artifacts.get(
      placementArtifacts.resourcePlacementOutcomes.id
    ) as { summary?: { plannedCount?: number; placedCount?: number } } | undefined;

    expect(firstRestamp).toBeGreaterThanOrEqual(0);
    expect(firstResourceIntent).toBeGreaterThan(firstRestamp);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(resourceOutcomes?.summary?.plannedCount ?? 0).toBeGreaterThan(0);
    expect(adapter.calls.setResourceType.length).toBe(resourceOutcomes?.summary?.placedCount);
  });

  it("aborts placement before resource materialization when region restamp fails", () => {
    const width = 20;
    const height = 12;
    const seed = 99;
    const adapter = new RestampFailingAdapter({
      width,
      height,
      mapInfo: {
        GridWidth: width,
        GridHeight: height,
        MinLatitude: -60,
        MaxLatitude: 60,
      },
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });

    expect(() => runRecipeWithAdapter(adapter, width, height, seed)).toThrow(
      /forced restamp failure/i
    );

    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.callOrder.includes("placeResourceIntent")).toBe(false);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });
});
