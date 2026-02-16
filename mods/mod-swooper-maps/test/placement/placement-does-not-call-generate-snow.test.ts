import { describe, it, expect, vi } from "vitest";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import placement from "../../src/domain/placement/ops.js";
import { getStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";
import { applyPlacementPlan } from "../../src/recipes/standard/stages/placement/steps/placement/apply.js";

describe("placement", () => {
  it("does not call adapter.generateSnow", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 4,
      mapInfo: {
        GridWidth: 4,
        GridHeight: 4,
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
        NumNaturalWonders: 1,
      },
      officialDiscoveriesPlacedCount: 1,
    });
    const context = createExtendedMapContext({ width: 4, height: 4 }, adapter, { seed: 0 });
    const runtime = getStandardRuntime(context);
    const baseStarts = {
      playersLandmass1: runtime.playersLandmass1,
      playersLandmass2: runtime.playersLandmass2,
      startSectorRows: runtime.startSectorRows,
      startSectorCols: runtime.startSectorCols,
      startSectors: runtime.startSectors,
    };

    const starts = placement.ops.planStarts.run(
      { baseStarts },
      placement.ops.planStarts.defaultConfig
    );
    const wonders = placement.ops.planWonders.run(
      { mapInfo: runtime.mapInfo },
      placement.ops.planWonders.defaultConfig
    );
    const floodplains = placement.ops.planFloodplains.run(
      {},
      placement.ops.planFloodplains.defaultConfig
    );
    const resources = {
      width: 4,
      height: 4,
      candidateResourceTypes: [1],
      targetCount: 1,
      plannedCount: 1,
      placements: [
        {
          plotIndex: 0,
          preferredResourceType: 1,
          preferredTypeOffset: 0,
          priority: 1,
        },
      ],
    };

    const placementRuntime = implementArtifacts([placementArtifacts.placementOutputs], {
      placementOutputs: {},
    });
    const outputs = applyPlacementPlan({
      context,
      starts,
      wonders,
      naturalWonderPlan: {
        width: 4,
        height: 4,
        wondersCount: 1,
        targetCount: 1,
        plannedCount: 1,
        placements: [{ plotIndex: 1, featureType: 39, direction: 0, elevation: 100, priority: 1 }],
      },
      discoveryPlan: {
        width: 4,
        height: 4,
        candidateDiscoveries: [{ discoveryVisualType: 0, discoveryActivationType: 0 }],
        targetCount: 1,
        plannedCount: 1,
        placements: [
          {
            plotIndex: 2,
            preferredDiscoveryVisualType: 0,
            preferredDiscoveryActivationType: 0,
            preferredDiscoveryOffset: 0,
            priority: 1,
          },
        ],
      },
      floodplains,
      resources,
      landmassRegionSlotByTile: {
        slotByTile: new Uint8Array(16).fill(1),
      },
      publishOutputs: (outputs) => placementRuntime.placementOutputs.publish(context, outputs),
    });

    expect(adapter.calls.generateSnow.length).toBe(0);
    expect(adapter.calls.stampNaturalWonder.length).toBe(1);
    expect(adapter.calls.stampDiscovery.length).toBe(0);
    expect(adapter.calls.generateOfficialResources.length).toBe(1);
    expect(adapter.calls.generateOfficialResources[0]).toMatchObject({
      width: 4,
      height: 4,
    });
    expect(adapter.calls.setResourceType.length).toBe(0);
    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(1);
    expect(adapter.calls.generateOfficialDiscoveries[0]).toMatchObject({
      width: 4,
      height: 4,
      polarMargin: 0,
    });
    expect(outputs.naturalWondersCount).toBe(1);
    expect(outputs.discoveriesCount).toBe(1);
  });

  it("uses official discovery generation without relying on runtime discovery candidate lookups", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 4,
      mapInfo: {
        GridWidth: 4,
        GridHeight: 4,
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
        NumNaturalWonders: 0,
      },
      officialDiscoveriesPlacedCount: 1,
    });
    const context = createExtendedMapContext({ width: 4, height: 4 }, adapter, { seed: 0 });
    const runtime = getStandardRuntime(context);
    const baseStarts = {
      playersLandmass1: runtime.playersLandmass1,
      playersLandmass2: runtime.playersLandmass2,
      startSectorRows: runtime.startSectorRows,
      startSectorCols: runtime.startSectorCols,
      startSectors: runtime.startSectors,
    };

    const starts = placement.ops.planStarts.run(
      { baseStarts },
      placement.ops.planStarts.defaultConfig
    );
    const wonders = placement.ops.planWonders.run(
      { mapInfo: runtime.mapInfo },
      placement.ops.planWonders.defaultConfig
    );
    const floodplains = placement.ops.planFloodplains.run(
      {},
      placement.ops.planFloodplains.defaultConfig
    );
    const placementRuntime = implementArtifacts([placementArtifacts.placementOutputs], {
      placementOutputs: {},
    });
    const discoveryVisualType = 2687284451;
    const discoveryActivationType = 2398750021;

    const outputs = applyPlacementPlan({
      context,
      starts,
      wonders,
      naturalWonderPlan: {
        width: 4,
        height: 4,
        wondersCount: 0,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      },
      discoveryPlan: {
        width: 4,
        height: 4,
        candidateDiscoveries: [],
        targetCount: 1,
        plannedCount: 1,
        placements: [
          {
            plotIndex: 2,
            preferredDiscoveryVisualType: discoveryVisualType,
            preferredDiscoveryActivationType: discoveryActivationType,
            preferredDiscoveryOffset: 0,
            priority: 1,
          },
        ],
      },
      floodplains,
      resources: {
        width: 4,
        height: 4,
        candidateResourceTypes: [1],
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      },
      landmassRegionSlotByTile: {
        slotByTile: new Uint8Array(16).fill(1),
      },
      publishOutputs: (published) => placementRuntime.placementOutputs.publish(context, published),
    });

    expect(adapter.calls.stampDiscovery.length).toBe(0);
    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(1);
    expect(adapter.calls.generateOfficialDiscoveries[0]?.startPositions.length ?? 0).toBeGreaterThan(0);
    expect(adapter.calls.generateOfficialDiscoveries[0]).toMatchObject({
      width: 4,
      height: 4,
      polarMargin: 0,
    });
    expect(outputs.discoveriesCount).toBe(1);
  });

  it("fails hard when official discovery generation throws", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 4,
      mapInfo: {
        GridWidth: 4,
        GridHeight: 4,
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
        NumNaturalWonders: 0,
      },
    });
    const discoverySpy = vi
      .spyOn(adapter, "generateOfficialDiscoveries")
      .mockImplementation(() => {
        throw new Error("forced official discovery failure");
      });
    const context = createExtendedMapContext({ width: 4, height: 4 }, adapter, { seed: 0 });
    const runtime = getStandardRuntime(context);
    const baseStarts = {
      playersLandmass1: runtime.playersLandmass1,
      playersLandmass2: runtime.playersLandmass2,
      startSectorRows: runtime.startSectorRows,
      startSectorCols: runtime.startSectorCols,
      startSectors: runtime.startSectors,
    };
    const starts = placement.ops.planStarts.run(
      { baseStarts },
      placement.ops.planStarts.defaultConfig
    );
    const wonders = placement.ops.planWonders.run(
      { mapInfo: runtime.mapInfo },
      placement.ops.planWonders.defaultConfig
    );
    const floodplains = placement.ops.planFloodplains.run(
      {},
      placement.ops.planFloodplains.defaultConfig
    );

    expect(() =>
      applyPlacementPlan({
        context,
        starts,
        wonders,
        naturalWonderPlan: {
          width: 4,
          height: 4,
          wondersCount: 0,
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        },
        discoveryPlan: {
          width: 4,
          height: 4,
          candidateDiscoveries: [],
          targetCount: 1,
          plannedCount: 1,
          placements: [
            {
              plotIndex: 2,
              preferredDiscoveryVisualType: 0,
              preferredDiscoveryActivationType: 0,
              preferredDiscoveryOffset: 0,
              priority: 1,
            },
          ],
        },
        floodplains,
        resources: {
          width: 4,
          height: 4,
          candidateResourceTypes: [1],
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        },
        landmassRegionSlotByTile: {
          slotByTile: new Uint8Array(16).fill(1),
        },
        publishOutputs: (outputs) => outputs,
      })
    ).toThrow(/placement\.discoveries failed/i);

    expect(discoverySpy).toHaveBeenCalledTimes(1);
    expect(adapter.calls.recalculateFertility).toBe(0);
    expect(adapter.calls.assignAdvancedStartRegions).toBe(0);
  });

  it("aborts placement when natural wonder stamping cannot fully satisfy the plan", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 4,
      mapInfo: {
        GridWidth: 4,
        GridHeight: 4,
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
        NumNaturalWonders: 2,
      },
      canHaveFeature: () => false,
    });
    const context = createExtendedMapContext({ width: 4, height: 4 }, adapter, { seed: 0 });
    const runtime = getStandardRuntime(context);
    const baseStarts = {
      playersLandmass1: runtime.playersLandmass1,
      playersLandmass2: runtime.playersLandmass2,
      startSectorRows: runtime.startSectorRows,
      startSectorCols: runtime.startSectorCols,
      startSectors: runtime.startSectors,
    };

    const starts = placement.ops.planStarts.run(
      { baseStarts },
      placement.ops.planStarts.defaultConfig
    );
    const wonders = placement.ops.planWonders.run(
      { mapInfo: runtime.mapInfo },
      placement.ops.planWonders.defaultConfig
    );
    const floodplains = placement.ops.planFloodplains.run(
      {},
      placement.ops.planFloodplains.defaultConfig
    );

    expect(() =>
      applyPlacementPlan({
        context,
        starts,
        wonders,
        naturalWonderPlan: {
          width: 4,
          height: 4,
          wondersCount: 2,
          targetCount: 2,
          plannedCount: 2,
          placements: [
            { plotIndex: 99, featureType: 39, direction: 0, elevation: 100, priority: 1 },
            { plotIndex: 1, featureType: 40, direction: 0, elevation: 100, priority: 1 },
          ],
        },
        discoveryPlan: {
          width: 4,
          height: 4,
          candidateDiscoveries: [{ discoveryVisualType: 0, discoveryActivationType: 0 }],
          targetCount: 2,
          plannedCount: 2,
          placements: [
            {
              plotIndex: 98,
              preferredDiscoveryVisualType: 0,
              preferredDiscoveryActivationType: 0,
              preferredDiscoveryOffset: 0,
              priority: 1,
            },
            {
              plotIndex: 2,
              preferredDiscoveryVisualType: 0,
              preferredDiscoveryActivationType: 0,
              preferredDiscoveryOffset: 0,
              priority: 1,
            },
          ],
        },
        floodplains,
        resources: {
          width: 4,
          height: 4,
          candidateResourceTypes: [1],
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        },
        landmassRegionSlotByTile: {
          slotByTile: new Uint8Array(16).fill(1),
        },
        publishOutputs: (outputs) => outputs,
      })
    ).toThrow(/placement\.wonders failed/i);

    expect(adapter.calls.stampNaturalWonder.length).toBe(0);
    expect(adapter.calls.stampDiscovery.length).toBe(0);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(0);
    expect(adapter.calls.setStartPosition.length).toBe(0);
    expect(adapter.calls.setResourceType.length).toBe(0);
  });

  it("fails explicitly when natural wonder metadata is invalid", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 4,
      mapInfo: {
        GridWidth: 4,
        GridHeight: 4,
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
        NumNaturalWonders: 1,
      },
    });
    const context = createExtendedMapContext({ width: 4, height: 4 }, adapter, { seed: 0 });
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
    const floodplains = placement.ops.planFloodplains.run(
      {},
      placement.ops.planFloodplains.defaultConfig
    );

    expect(() =>
      applyPlacementPlan({
        context,
        starts,
        wonders,
        naturalWonderPlan: {
          width: 4,
          height: 4,
          wondersCount: 1,
          targetCount: 1,
          plannedCount: 1,
          placements: [
            {
              plotIndex: 3,
              featureType: Number.NaN,
              direction: 0,
              elevation: 100,
              priority: 1,
            },
          ],
        },
        discoveryPlan: {
          width: 4,
          height: 4,
          candidateDiscoveries: [],
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        },
        floodplains,
        resources: {
          width: 4,
          height: 4,
          candidateResourceTypes: [1],
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        },
        landmassRegionSlotByTile: {
          slotByTile: new Uint8Array(16).fill(1),
        },
        publishOutputs: (outputs) => outputs,
      })
    ).toThrow(/invalid feature metadata/i);

    expect(adapter.calls.generateOfficialDiscoveries.length).toBe(0);
  });
});
