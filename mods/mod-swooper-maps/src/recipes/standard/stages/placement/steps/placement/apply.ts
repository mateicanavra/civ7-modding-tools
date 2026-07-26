import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import type { MapContext, TraceJsonObject } from "@swooper/mapgen-core";
import type { ArtifactReadValueOf, DeepReadonly } from "@swooper/mapgen-core/authoring";
import {
  type CurrentEngineHeightfield,
  type EngineHeightfieldObservation,
  engineLandMaskFromWaterMask,
} from "../../../../current-engine-surface.js";
import { logAsciiMap, logTerrainStats } from "../../log.js";

type LandmassRegionSlotByTile = ArtifactReadValueOf<
  typeof placementRegionArtifacts.landmassRegionSlotByTile
>;
type NaturalWonderPlacement = ArtifactReadValueOf<
  typeof placementWonderArtifacts.naturalWonderPlacement
>;
type ResourcePlacementOutcomes = ArtifactReadValueOf<
  typeof resourceSiteArtifacts.resourcePlacementOutcomes
>;
type StartAssignment = ArtifactReadValueOf<typeof placementStartArtifacts.startAssignment>;

type ApplyPlacementArgs = {
  context: MapContext;
  currentEngineHeightfield: CurrentEngineHeightfield;
  naturalWonderPlacement: DeepReadonly<NaturalWonderPlacement>;
  resourcePlacement: DeepReadonly<ResourcePlacementOutcomes>;
  startAssignment: DeepReadonly<StartAssignment>;
  landmassRegionSlotByTile: DeepReadonly<LandmassRegionSlotByTile>;
  topographyLandMask: DeepReadonly<Uint8Array>;
};

/** Completed placement evidence needed by the terminal step's optional visualization facet. */
export type ApplyPlacementResult = Readonly<{
  engineObservation: EngineHeightfieldObservation;
  waterDrift: Uint8Array;
  summary: Readonly<{
    slotCounts: Readonly<{ none: number; west: number; east: number }>;
    naturalWondersCount: number;
    resourcesCount: number;
    startsAssigned: number;
    waterDriftCount: number;
  }>;
}>;

/**
 * Collates final placement evidence after product-owned steps have already
 * mutated the Civ7 engine.
 *
 * This terminal step intentionally has no product materialization helpers. It
 * reads immutable products, records the final adapter observation, and returns
 * summary evidence so the recipe can observe placement completion without hiding more
 * engine writes behind a broad `apply` owner.
 */
export function applyPlacementPlan({
  context,
  currentEngineHeightfield,
  naturalWonderPlacement,
  resourcePlacement,
  startAssignment,
  landmassRegionSlotByTile,
  topographyLandMask,
}: ApplyPlacementArgs): ApplyPlacementResult {
  const { width, height } = context.setup.dimensions;
  const emit = (payload: TraceJsonObject): void => {
    context.trace.event(() => payload);
  };

  emit({ type: "placement.start", message: "[SWOOPER_MOD] === placement summary ===" });
  emit({ type: "placement.start", message: `[SWOOPER_MOD] Map size: ${width}x${height}` });

  // The wonder placement artifact is validated at its publish site; this
  // terminal step consumes it directly instead of re-normalizing it through a
  // cross-step helper import.
  const slotByTile = landmassRegionSlotByTile.slotByTile;
  const slotCounts = { none: 0, west: 0, east: 0 };
  for (const slot of slotByTile) {
    if (slot === 1) slotCounts.west += 1;
    else if (slot === 2) slotCounts.east += 1;
    else slotCounts.none += 1;
  }
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
  logTerrainStats(context, "Final", currentEngineHeightfield);
  logAsciiMap(context, currentEngineHeightfield);

  // Compare the final Morphology land classification with the engine surface
  // after all placement product work has completed.
  const engineObservation: EngineHeightfieldObservation = {
    terrain: currentEngineHeightfield.terrain,
    elevation: currentEngineHeightfield.elevation,
    landMask: engineLandMaskFromWaterMask(currentEngineHeightfield.waterMask),
  };
  const engineLandMask = engineObservation.landMask;
  let waterDriftCount = 0;
  const waterDrift = new Uint8Array(engineLandMask.length);
  for (let i = 0; i < engineLandMask.length; i++) {
    if ((engineLandMask[i] ?? 0) !== (topographyLandMask[i] ?? 0)) {
      waterDriftCount += 1;
      // 1 = engine land where physics says water; 2 = engine water where physics says land.
      waterDrift[i] = (engineLandMask[i] ?? 0) === 1 ? 1 : 2;
    }
  }
  emit({
    type: "placement.parity",
    slotCounts,
    wondersPlanned: naturalWonderPlacement.plannedCount,
    wondersPlaced: naturalWonderPlacement.placedCount,
    resourcesAttempted: true,
    resourcesPlaced,
    waterDriftCount,
    starts: startTierSummary,
  });

  return {
    engineObservation,
    waterDrift,
    summary: {
      slotCounts,
      naturalWondersCount: naturalWonderPlacement.placedCount,
      resourcesCount: resourcesPlaced,
      startsAssigned,
      waterDriftCount,
    },
  };
}
