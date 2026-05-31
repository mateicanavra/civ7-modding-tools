import type { ExtendedMapContext } from "@swooper/mapgen-core";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";

import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import type { NaturalWonderStampingStats } from "../place-natural-wonders/materialize.js";
import { normalizeNaturalWonderStampingStats } from "../place-natural-wonders/materialize.js";
import type { StartAssignmentResult } from "../assign-starts/materialize.js";
import { logAsciiMap, logTerrainStats } from "../terrain-diagnostics.js";
import type { PlacementOutputsV1 } from "../../placement-outputs.js";

type LandmassRegionSlotByTile = Static<
  (typeof import("../../../../map-artifacts.js").mapArtifacts)["landmassRegionSlotByTile"]["schema"]
>;
type EngineTerrainSnapshot = Static<
  (typeof import("../../../../map-artifacts.js").mapArtifacts)["placementEngineTerrainSnapshot"]["schema"]
>;
type PlacementEngineState = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["engineState"]["schema"]
>;
type PlacementSurfacePreparation = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["placementSurfacePreparation"]["schema"]
>;
type ResourcePlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["resourcePlacementOutcomes"]["schema"]
>;
type DiscoveryPlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["discoveryPlacementOutcomes"]["schema"]
>;
type AdvancedStartAssignment = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["advancedStartAssignment"]["schema"]
>;

type ApplyPlacementArgs = {
  context: ExtendedMapContext;
  naturalWonderPlacement: DeepReadonly<NaturalWonderStampingStats>;
  surfacePreparation: DeepReadonly<PlacementSurfacePreparation>;
  resourcePlacement: DeepReadonly<ResourcePlacementOutcomes>;
  startAssignment: DeepReadonly<StartAssignmentResult>;
  discoveryPlacement: DeepReadonly<DiscoveryPlacementOutcomes>;
  advancedStartAssignment: DeepReadonly<AdvancedStartAssignment>;
  landmassRegionSlotByTile: DeepReadonly<LandmassRegionSlotByTile>;
  publishOutputs: (outputs: PlacementOutputsV1) => DeepReadonly<PlacementOutputsV1>;
  publishEngineState?: (engineState: PlacementEngineState) => DeepReadonly<PlacementEngineState>;
  publishEngineTerrainSnapshot?: (
    snapshot: EngineTerrainSnapshot
  ) => DeepReadonly<EngineTerrainSnapshot>;
};

const GROUP_GAMEPLAY = "Gameplay / Placement";

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

  const wonderStamping = normalizeNaturalWonderStampingStats(naturalWonderPlacement);
  const slotByTile = landmassRegionSlotByTile.slotByTile;
  const slotCounts = surfacePreparation.slotCounts;
  const resourcesPlaced = resourcePlacement.summary.placedCount;
  const startsAssigned = startAssignment.assigned;
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

  const physics = context.buffers.heightfield;
  const engineSnapshot = snapshotEngineHeightfield(context);
  const engineLandMask = engineSnapshot
    ? engineSnapshot.landMask
    : new Uint8Array(physics.landMask);
  let waterDriftCount = 0;
  for (let i = 0; i < engineLandMask.length; i++) {
    if ((engineLandMask[i] ?? 0) !== (physics.landMask[i] ?? 0)) waterDriftCount += 1;
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
      spaceId: "tile.hexOddR",
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
    wondersPlanned: wonderStamping.plannedCount,
    wondersPlaced: wonderStamping.placedCount,
    discoveriesPlanned,
    discoveriesPlaced,
  });

  emit({
    type: "placement.parity",
    slotCounts,
    wondersPlanned: wonderStamping.plannedCount,
    wondersPlaced: wonderStamping.placedCount,
    resourcesAttempted: true,
    resourcesPlaced,
    discoveriesPlanned,
    discoveriesPlaced,
    waterDriftCount,
  });

  return publishOutputs({
    naturalWondersCount: wonderStamping.placedCount,
    floodplainsCount: 0,
    snowTilesCount: 0,
    resourcesCount: resourcesPlaced,
    startsAssigned,
    discoveriesCount: discoveriesPlaced,
  });
}
