import { describe, it, expect } from "vitest";
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
        targetCount: 1,
        plannedCount: 1,
        placements: [{ plotIndex: 2, discoveryVisualType: 0, discoveryActivationType: 0, priority: 1 }],
      },
      floodplains,
      resources,
      landmassRegionSlotByTile: {
        slotByTile: new Uint8Array(16).fill(1),
      },
      publishOutputs: (outputs) => placementRuntime.placementOutputs.publish(context, outputs),
    });

    expect(adapter.calls.generateSnow.length).toBe(0);
    expect(adapter.calls.addNaturalWonders.length).toBe(0);
    expect(adapter.calls.generateDiscoveries.length).toBe(0);
    expect(adapter.calls.generateResources.length).toBe(0);
    expect(adapter.calls.stampNaturalWonder.length).toBe(1);
    expect(adapter.calls.stampDiscovery.length).toBe(1);
    expect(outputs.naturalWondersCount).toBe(1);
    expect(outputs.discoveriesCount).toBe(1);
  });

  it("reports stamped wonder/discovery counts (not planned counts)", () => {
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
        targetCount: 2,
        plannedCount: 2,
        placements: [
          { plotIndex: 98, discoveryVisualType: 0, discoveryActivationType: 0, priority: 1 },
          { plotIndex: 2, discoveryVisualType: 0, discoveryActivationType: 0, priority: 1 },
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
      publishOutputs: (outputs) => placementRuntime.placementOutputs.publish(context, outputs),
    });

    expect(adapter.calls.addNaturalWonders.length).toBe(0);
    expect(adapter.calls.generateDiscoveries.length).toBe(0);
    expect(adapter.calls.stampNaturalWonder.length).toBe(0);
    expect(adapter.calls.stampDiscovery.length).toBe(1);
    expect(outputs.naturalWondersCount).toBe(0);
    expect(outputs.discoveriesCount).toBe(1);
  });
});
