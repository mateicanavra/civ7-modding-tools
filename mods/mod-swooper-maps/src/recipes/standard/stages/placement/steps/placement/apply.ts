import type { ExtendedMapContext } from "@swooper/mapgen-core";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";

import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import { logAsciiMap, logTerrainStats } from "../terrain-diagnostics.js";
import type { PlacementOutputsV1 } from "../../placement-outputs.js";
import {
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
  transparentNoneCategory,
} from "../../viz.js";

type LandmassRegionSlotByTile = Static<
  typeof import("../../../../map-artifacts.js").mapArtifacts["landmassRegionSlotByTile"]["schema"]
>;
type NaturalWonderPlacement = Static<
  typeof import("../../artifacts.js").placementArtifacts["naturalWonderPlacement"]["schema"]
>;
type EngineTerrainSnapshot = Static<
  typeof import("../../../../map-artifacts.js").mapArtifacts["placementEngineTerrainSnapshot"]["schema"]
>;
type PlacementEngineState = Static<
  typeof import("../../artifacts.js").placementArtifacts["engineState"]["schema"]
>;
type PlacementSurfacePreparation = Static<
  typeof import("../../artifacts.js").placementArtifacts["placementSurfacePreparation"]["schema"]
>;
type ResourcePlacementOutcomes = Static<
  typeof import("../../artifacts.js").placementArtifacts["resourcePlacementOutcomes"]["schema"]
>;
type DiscoveryPlacementOutcomes = Static<
  typeof import("../../artifacts.js").placementArtifacts["discoveryPlacementOutcomes"]["schema"]
>;
type AdvancedStartAssignment = Static<
  typeof import("../../artifacts.js").placementArtifacts["advancedStartAssignment"]["schema"]
>;
type StartAssignment = Static<
  typeof import("../../artifacts.js").placementArtifacts["startAssignment"]["schema"]
>;

type ApplyPlacementArgs = {
  context: ExtendedMapContext;
  naturalWonderPlacement: DeepReadonly<NaturalWonderPlacement>;
  surfacePreparation: DeepReadonly<PlacementSurfacePreparation>;
  resourcePlacement: DeepReadonly<ResourcePlacementOutcomes>;
  startAssignment: DeepReadonly<StartAssignment>;
  discoveryPlacement: DeepReadonly<DiscoveryPlacementOutcomes>;
  advancedStartAssignment: DeepReadonly<AdvancedStartAssignment>;
  landmassRegionSlotByTile: DeepReadonly<LandmassRegionSlotByTile>;
  publishOutputs: (outputs: PlacementOutputsV1) => DeepReadonly<PlacementOutputsV1>;
  publishEngineState?: (engineState: PlacementEngineState) => DeepReadonly<PlacementEngineState>;
  publishEngineTerrainSnapshot?: (
    snapshot: EngineTerrainSnapshot
  ) => DeepReadonly<EngineTerrainSnapshot>;
};

const GROUP_GAMEPLAY = PLACEMENT_VIZ_GROUP;

/**
 * Collates final placement evidence after product-owned steps have already
 * mutated the Civ7 engine.
 *
 * This terminal step intentionally has no product materialization helpers. It
 * verifies artifacts, captures final engine snapshots, and publishes summary
 * evidence so the recipe can observe placement completion without hiding more
 * engine writes behind a broad `apply` owner.
 */
export function applyPlacementPlan({
  context,
  naturalWonderPlacement,
  surfacePreparation,
  resourcePlacement,
  startAssignment,
  discoveryPlacement,
  advancedStartAssignment,
  landmassRegionSlotByTile,
  publishOutputs,
  publishEngineState = (engineState) => engineState,
  publishEngineTerrainSnapshot = (snapshot) => snapshot,
}: ApplyPlacementArgs): DeepReadonly<PlacementOutputsV1> {
  const { adapter, trace } = context;
  const { width, height } = context.dimensions;
  const emit = (payload: Record<string, unknown>): void => {
    if (!trace?.isVerbose) return;
    trace.event(() => payload);
  };

  emit({ type: "placement.start", message: "[SWOOPER_MOD] === placement summary ===" });
  emit({ type: "placement.start", message: `[SWOOPER_MOD] Map size: ${width}x${height}` });

  // The wonder placement artifact is validated at its publish site; this
  // terminal step consumes it directly instead of re-normalizing it through a
  // cross-step helper import.
  const slotByTile = landmassRegionSlotByTile.slotByTile;
  const slotCounts = surfacePreparation.slotCounts;
  const resourcesPlaced = resourcePlacement.summary.placedCount;
  const startsAssigned = startAssignment.assigned;
  const startTierSummary = {
    primaryAssigned: startAssignment.primaryAssigned,
    islandClusterAssigned: startAssignment.islandClusterAssigned,
    marginalAssigned: startAssignment.marginalAssigned,
    noneAssigned: startAssignment.noneAssigned,
    rungCounts: startAssignment.rungCounts,
    status: startAssignment.status,
    candidateCount: startAssignment.candidateCount,
    tierCounts: startAssignment.tierCounts,
  };
  const discoveriesPlanned = discoveryPlacement.summary.plannedCount;
  const discoveriesPlaced = discoveryPlacement.summary.placedCount;

  if (
    !advancedStartAssignment.fertilityRecalculated ||
    !advancedStartAssignment.advancedStartsAssigned
  ) {
    throw new Error("[Placement] Advanced start evidence is incomplete.");
  }

  logTerrainStats(trace, adapter, width, height, "Final");
  logAsciiMap(trace, adapter, width, height);

  // DECLARED physics-buffer parity read: comparing the Morphology physics
  // land mask against the engine surface is the purpose of this snapshot
  // (waterDriftCount evidence), so the heightfield buffer — not the engine —
  // is the intended comparison source here.
  const physics = context.buffers.heightfield;
  const engineSnapshot = snapshotEngineHeightfield(context);
  const engineLandMask = engineSnapshot
    ? engineSnapshot.landMask
    : new Uint8Array(physics.landMask);
  let waterDriftCount = 0;
  const waterDrift = new Uint8Array(engineLandMask.length);
  for (let i = 0; i < engineLandMask.length; i++) {
    if ((engineLandMask[i] ?? 0) !== (physics.landMask[i] ?? 0)) {
      waterDriftCount += 1;
      // 1 = engine land where physics says water; 2 = engine water where physics says land.
      waterDrift[i] = (engineLandMask[i] ?? 0) === 1 ? 1 : 2;
    }
  }
  // S7 (debug evidence): the per-tile surface behind waterDriftCount — where
  // the final engine land mask diverged from the Morphology physics mask.
  if (engineSnapshot && waterDrift.length === width * height) {
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.placement.engine.waterDrift",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: waterDrift,
      meta: defineVizMeta("map.placement.engine.waterDrift", {
        label: "Engine vs Physics Water Drift",
        group: GROUP_GAMEPLAY,
        visibility: "debug",
        description:
          "Tiles where the post-placement engine land mask disagrees with the Morphology physics land mask (the waterDriftCount parity evidence).",
        palette: "categorical",
        categories: [
          transparentNoneCategory("In Agreement"),
          { value: 1, label: "Engine Land / Physics Water", color: [34, 197, 94, 235] },
          { value: 2, label: "Engine Water / Physics Land", color: [239, 68, 68, 235] },
        ],
      }),
    });
  }

  if (engineSnapshot) {
    publishEngineTerrainSnapshot({
      stage: "placement/placement",
      width,
      height,
      landMask: engineSnapshot.landMask,
      terrain: engineSnapshot.terrain,
      elevation: engineSnapshot.elevation,
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.placement.engine.landMask",
      spaceId: "tile.hexOddQ",
      dims: { width, height },
      format: "u8",
      values: engineSnapshot.landMask,
      meta: defineVizMeta("map.placement.engine.landMask", {
        label: "Land Mask (Engine After Placement)",
        group: GROUP_GAMEPLAY,
        palette: "categorical",
        role: "engine",
      }),
    });
  }

  publishEngineState({
    width,
    height,
    slotByTile: new Uint8Array(slotByTile),
    engineLandMask,
    slotCounts,
    startsAssigned,
    resourcesAttempted: true,
    resourcesPlaced,
    waterDriftCount,
    wondersPlanned: naturalWonderPlacement.plannedCount,
    wondersPlaced: naturalWonderPlacement.placedCount,
    discoveriesPlanned,
    discoveriesPlaced,
  });

  emit({
    type: "placement.parity",
    slotCounts,
    wondersPlanned: naturalWonderPlacement.plannedCount,
    wondersPlaced: naturalWonderPlacement.placedCount,
    resourcesAttempted: true,
    resourcesPlaced,
    discoveriesPlanned,
    discoveriesPlaced,
    waterDriftCount,
    starts: startTierSummary,
  });

  return publishOutputs({
    naturalWondersCount: naturalWonderPlacement.placedCount,
    resourcesCount: resourcesPlaced,
    startsAssigned,
    discoveriesCount: discoveriesPlaced,
  });
}
