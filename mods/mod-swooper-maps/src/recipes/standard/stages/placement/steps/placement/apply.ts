import { snapshotEngineHeightfield } from "@civ7/adapter/mapgen";
import type { MapContext, TraceJsonObject } from "@swooper/mapgen-core";

import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import type { PlacementOutputsV1 } from "../../artifacts/placement-outputs.artifact.js";
import { logAsciiMap, logTerrainStats } from "../../log.js";

type LandmassRegionSlotByTile = Static<
  typeof import("../../../../artifacts/index.js").artifacts["landmassRegionSlotByTile"]["schema"]
>;
type NaturalWonderPlacement = Static<
  typeof import("../../artifacts/index.js").artifacts["naturalWonderPlacement"]["schema"]
>;
type EngineTerrainSnapshot = Static<
  typeof import("../../../../artifacts/index.js").artifacts["placementEngineTerrainSnapshot"]["schema"]
>;
type PlacementEngineState = Static<
  typeof import("../../artifacts/index.js").artifacts["engineState"]["schema"]
>;
type PlacementSurfacePreparation = Static<
  typeof import("../../artifacts/index.js").artifacts["placementSurfacePreparation"]["schema"]
>;
type ResourcePlacementOutcomes = Static<
  typeof import("../../artifacts/index.js").artifacts["resourcePlacementOutcomes"]["schema"]
>;
type DiscoveryPlacementOutcomes = Static<
  typeof import("../../artifacts/index.js").artifacts["discoveryPlacementOutcomes"]["schema"]
>;
type AdvancedStartAssignment = Static<
  typeof import("../../artifacts/index.js").artifacts["advancedStartAssignment"]["schema"]
>;
type StartAssignment = Static<
  typeof import("../../artifacts/index.js").artifacts["startAssignment"]["schema"]
>;

type ApplyPlacementArgs = {
  context: MapContext;
  naturalWonderPlacement: DeepReadonly<NaturalWonderPlacement>;
  surfacePreparation: DeepReadonly<PlacementSurfacePreparation>;
  resourcePlacement: DeepReadonly<ResourcePlacementOutcomes>;
  startAssignment: DeepReadonly<StartAssignment>;
  discoveryPlacement: DeepReadonly<DiscoveryPlacementOutcomes>;
  advancedStartAssignment: DeepReadonly<AdvancedStartAssignment>;
  landmassRegionSlotByTile: DeepReadonly<LandmassRegionSlotByTile>;
  topographyLandMask: DeepReadonly<Uint8Array>;
  publishOutputs: (outputs: PlacementOutputsV1) => DeepReadonly<PlacementOutputsV1>;
  publishEngineState?: (engineState: PlacementEngineState) => DeepReadonly<PlacementEngineState>;
  publishEngineTerrainSnapshot?: (
    snapshot: EngineTerrainSnapshot
  ) => DeepReadonly<EngineTerrainSnapshot>;
};

type EngineHeightfieldSnapshot = ReturnType<typeof snapshotEngineHeightfield>;

/** Completed placement evidence needed by the terminal step's optional visualization facet. */
export type ApplyPlacementResult = Readonly<{
  engineSnapshot: EngineHeightfieldSnapshot;
  waterDrift: Uint8Array;
}>;

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
  topographyLandMask,
  publishOutputs,
  publishEngineState = (engineState) => engineState,
  publishEngineTerrainSnapshot = (snapshot) => snapshot,
}: ApplyPlacementArgs): ApplyPlacementResult {
  const { trace } = context;
  const { width, height } = context.setup.dimensions;
  const emit = (payload: TraceJsonObject): void => {
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

  logTerrainStats(context, "Final");
  logAsciiMap(context);

  // Compare the final Morphology land classification with the engine surface
  // after all placement product work has completed.
  const engineSnapshot = snapshotEngineHeightfield(context.adapter);
  const engineLandMask = engineSnapshot.landMask;
  let waterDriftCount = 0;
  const waterDrift = new Uint8Array(engineLandMask.length);
  for (let i = 0; i < engineLandMask.length; i++) {
    if ((engineLandMask[i] ?? 0) !== (topographyLandMask[i] ?? 0)) {
      waterDriftCount += 1;
      // 1 = engine land where physics says water; 2 = engine water where physics says land.
      waterDrift[i] = (engineLandMask[i] ?? 0) === 1 ? 1 : 2;
    }
  }
  publishEngineTerrainSnapshot({
    stage: "placement/placement",
    width,
    height,
    landMask: engineSnapshot.landMask,
    terrain: engineSnapshot.terrain,
    elevation: engineSnapshot.elevation,
  });

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

  publishOutputs({
    naturalWondersCount: naturalWonderPlacement.placedCount,
    resourcesCount: resourcesPlaced,
    startsAssigned,
    discoveriesCount: discoveriesPlaced,
  });
  return { engineSnapshot, waterDrift };
}
