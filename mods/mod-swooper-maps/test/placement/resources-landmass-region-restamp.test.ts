import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import placement from "../../src/domain/placement/ops.js";
import { getStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { applyPlacementPlan } from "../../src/recipes/standard/stages/placement/steps/placement/apply.js";

class RegionSensitiveResourceAdapter extends MockAdapter {
  private regionByTile: Uint8Array;
  resourcesPlaced = 0;

  constructor(config: ConstructorParameters<typeof MockAdapter>[0]) {
    super(config);
    this.regionByTile = new Uint8Array(Math.max(0, this.width * this.height));
    this.regionByTile.fill(this.getLandmassId("NONE"));
  }

  private idx2(x: number, y: number): number {
    return y * this.width + x;
  }

  override setLandmassRegionId(x: number, y: number, regionId: number): void {
    super.setLandmassRegionId(x, y, regionId);
    this.regionByTile[this.idx2(x, y)] = regionId & 0xff;
  }

  override validateAndFixTerrain(): void {
    // Simulate engine normalization that can clear custom projection ids.
    this.regionByTile.fill(this.getLandmassId("NONE"));
  }

  override generateResources(width: number, height: number): void {
    const none = this.getLandmassId("NONE");
    let eligibleTiles = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.regionByTile[this.idx2(x, y)] !== none) eligibleTiles += 1;
      }
    }
    this.resourcesPlaced = eligibleTiles;
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

describe("placement resources landmass-region restamp", () => {
  it("re-stamps landmass regions immediately before resources so placement survives terrain validation", () => {
    const width = 10;
    const height = 6;
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

    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const context = createExtendedMapContext({ width, height }, adapter, env);

    // Simulate projection step output pre-populating engine ids before placement apply.
    const west = adapter.getLandmassId("WEST");
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setLandmassRegionId(x, y, west);
      }
    }

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
      landmassRegionSlotByTile: { slotByTile: new Uint8Array(width * height).fill(1) },
      publishOutputs: (outputs) => outputs,
    });

    expect(adapter.resourcesPlaced).toBeGreaterThan(0);
  });

  it("aborts placement before resource generation when region restamp fails", () => {
    const width = 4;
    const height = 4;
    const seed = 99;
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

    const adapter = new RestampFailingAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });

    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const context = createExtendedMapContext({ width, height }, adapter, env);
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

    expect(() =>
      applyPlacementPlan({
        context,
        starts,
        wonders,
        floodplains,
        landmassRegionSlotByTile: { slotByTile: new Uint8Array(width * height).fill(1) },
        publishOutputs: (outputs) => outputs,
      })
    ).toThrow(/restamp failed/i);

    expect(adapter.resourcesPlaced).toBe(0);
  });
});
