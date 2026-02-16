import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import placement from "../../src/domain/placement/ops.js";
import { getStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { applyPlacementPlan } from "../../src/recipes/standard/stages/placement/steps/placement/apply.js";

class RegionSensitiveResourceAdapter extends MockAdapter {
  readonly callOrder: string[] = [];

  override setLandmassRegionId(x: number, y: number, regionId: number): void {
    this.callOrder.push("setLandmassRegionId");
    super.setLandmassRegionId(x, y, regionId);
  }

  override validateAndFixTerrain(): void {
    // Simulate engine normalization that can clear custom projection ids.
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        super.setLandmassRegionId(x, y, this.getLandmassId("NONE"));
      }
    }
  }

  override generateOfficialResources(
    width: number,
    height: number,
    minMarineResourceTypesOverride?: number
  ): number {
    this.callOrder.push("generateOfficialResources");
    return super.generateOfficialResources(width, height, minMarineResourceTypesOverride);
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

function buildPlacementInputs(
  adapter: MockAdapter,
  width: number,
  height: number,
  seed: number
) {
  const context = createExtendedMapContext(
    { width, height },
    adapter,
    {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }
  );
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
  return { context, starts, wonders, floodplains };
}

describe("placement resources landmass-region restamp", () => {
  it("re-stamps landmass regions before official resource generation", () => {
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
      officialResourcesPlacedCount: 1,
    });

    const { context, starts, wonders, floodplains } = buildPlacementInputs(adapter, width, height, seed);

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
      resources: {
        width,
        height,
        candidateResourceTypes: [7],
        targetCount: 1,
        plannedCount: 1,
        placements: [
          {
            plotIndex: 0,
            preferredResourceType: 7,
            preferredTypeOffset: 0,
            priority: 1,
          },
        ],
      },
      landmassRegionSlotByTile: { slotByTile: new Uint8Array(width * height).fill(1) },
      publishOutputs: (placementOutputs) => placementOutputs,
    });

    const firstRestamp = adapter.callOrder.indexOf("setLandmassRegionId");
    const firstOfficialResourceGeneration = adapter.callOrder.indexOf("generateOfficialResources");
    expect(firstRestamp).toBeGreaterThanOrEqual(0);
    expect(firstOfficialResourceGeneration).toBeGreaterThan(firstRestamp);
    expect(adapter.calls.generateOfficialResources).toEqual([
      { width, height, minMarineResourceTypesOverride: undefined },
    ]);
    expect(adapter.calls.setResourceType.length).toBe(0);
    expect(outputs.resourcesCount).toBe(1);
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

    const { context, starts, wonders, floodplains } = buildPlacementInputs(adapter, width, height, seed);

    expect(() =>
      applyPlacementPlan({
        context,
        starts,
        wonders,
        floodplains,
        landmassRegionSlotByTile: { slotByTile: new Uint8Array(width * height).fill(1) },
        publishOutputs: (placementOutputs) => placementOutputs,
      })
    ).toThrow(/restamp failed/i);

    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });

  it("fails hard when official resource generation throws", () => {
    const width = 4;
    const height = 4;
    const seed = 31415;
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

    const adapter = new MockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    adapter.generateOfficialResources = () => {
      throw new Error("forced official resource failure");
    };

    const { context, starts, wonders, floodplains } = buildPlacementInputs(adapter, width, height, seed);

    expect(() =>
      applyPlacementPlan({
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
        resources: {
          width,
          height,
          candidateResourceTypes: [7],
          targetCount: 1,
          plannedCount: 1,
          placements: [
            {
              plotIndex: 0,
              preferredResourceType: 7,
              preferredTypeOffset: 0,
              priority: 1,
            },
          ],
        },
        landmassRegionSlotByTile: { slotByTile: new Uint8Array(width * height).fill(1) },
        publishOutputs: (placementOutputs) => placementOutputs,
      })
    ).toThrow(/placement\.resources failed/i);

    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });
});
