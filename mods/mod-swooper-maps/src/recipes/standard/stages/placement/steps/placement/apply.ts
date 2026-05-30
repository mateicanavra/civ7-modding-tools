import type { ExtendedMapContext, TraceScope } from "@swooper/mapgen-core";
import type {
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
  ResourcePlacementIntent,
  ResourcePlacementOutcome,
} from "@civ7/adapter";
import {
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  defineVizMeta,
  getTerrainSymbol,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import placement from "@mapgen/domain/placement";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import type { PlacementOutputsV1 } from "../../placement-outputs.js";

type PlanFloodplainsOutput = Static<(typeof placement.ops.planFloodplains)["output"]>;
type PlanDiscoveriesOutput = Static<(typeof placement.ops.planDiscoveries)["output"]>;
type PlanNaturalWondersOutput = Static<(typeof placement.ops.planNaturalWonders)["output"]>;
type PlanResourcesOutput = Static<(typeof placement.ops.planResources)["output"]>;
type PlanStartsOutput = Static<(typeof placement.ops.planStarts)["output"]>;
type PlanWondersOutput = Static<(typeof placement.ops.planWonders)["output"]>;

type LandmassRegionSlotByTile = Static<
  (typeof import("../../../../map-artifacts.js").mapArtifacts)["landmassRegionSlotByTile"]["schema"]
>;
type EngineTerrainSnapshot = Static<
  (typeof import("../../../../map-artifacts.js").mapArtifacts)["placementEngineTerrainSnapshot"]["schema"]
>;
type PlacementEngineState = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["engineState"]["schema"]
>;
type ResourcePlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["resourcePlacementOutcomes"]["schema"]
>;
type DiscoveryPlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["discoveryPlacementOutcomes"]["schema"]
>;

type ApplyPlacementArgs = {
  context: ExtendedMapContext;
  starts: DeepReadonly<PlanStartsOutput>;
  wonders: DeepReadonly<PlanWondersOutput>;
  naturalWonderPlacement?: DeepReadonly<NaturalWonderStampingStats>;
  naturalWonderPlan: DeepReadonly<PlanNaturalWondersOutput>;
  discoveryPlan: DeepReadonly<PlanDiscoveriesOutput>;
  floodplains: DeepReadonly<PlanFloodplainsOutput>;
  resources: DeepReadonly<PlanResourcesOutput>;
  landmassRegionSlotByTile: DeepReadonly<LandmassRegionSlotByTile>;
  publishOutputs: (outputs: PlacementOutputsV1) => DeepReadonly<PlacementOutputsV1>;
  publishEngineState?: (engineState: PlacementEngineState) => DeepReadonly<PlacementEngineState>;
  publishResourcePlacementOutcomes?: (
    outcomes: ResourcePlacementOutcomes
  ) => DeepReadonly<ResourcePlacementOutcomes>;
  publishDiscoveryPlacementOutcomes?: (
    outcomes: DiscoveryPlacementOutcomes
  ) => DeepReadonly<DiscoveryPlacementOutcomes>;
  publishEngineTerrainSnapshot?: (
    snapshot: EngineTerrainSnapshot
  ) => DeepReadonly<EngineTerrainSnapshot>;
};

const GROUP_GAMEPLAY = "Gameplay / Placement";
type RegionSlot = 0 | 1 | 2;
const START_POSITION_COLORS: Array<[number, number, number, number]> = [
  [59, 130, 246, 230],
  [239, 68, 68, 230],
  [34, 197, 94, 230],
  [245, 158, 11, 230],
  [168, 85, 247, 230],
  [14, 116, 144, 230],
  [249, 115, 22, 230],
  [99, 102, 241, 230],
];

function colorForStartPosition(index: number): [number, number, number, number] {
  return START_POSITION_COLORS[index % START_POSITION_COLORS.length] ?? [148, 163, 184, 220];
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function runPlacementStep<T>(
  stepId: string,
  emit: (payload: Record<string, unknown>) => void,
  fn: () => T
): T {
  try {
    return fn();
  } catch (error) {
    const message = toErrorMessage(error);
    emit({ type: `${stepId}.error`, error: message });
    throw new Error(`[SWOOPER_MOD] Aborting placement: ${stepId} failed (${message}).`);
  }
}

export function applyPlacementPlan({
  context,
  starts,
  wonders,
  naturalWonderPlacement,
  naturalWonderPlan,
  discoveryPlan,
  floodplains,
  resources,
  landmassRegionSlotByTile,
  publishOutputs,
  publishEngineState = (engineState) => engineState,
  publishResourcePlacementOutcomes = (outcomes) => outcomes,
  publishDiscoveryPlacementOutcomes = (outcomes) => outcomes,
  publishEngineTerrainSnapshot = (snapshot) => snapshot,
}: ApplyPlacementArgs): DeepReadonly<PlacementOutputsV1> {
  const { adapter, trace } = context;
  const { width, height } = context.dimensions;
  const emit = (payload: Record<string, unknown>): void => {
    if (!trace?.isVerbose) return;
    trace.event(() => payload);
  };

  emit({ type: "placement.start", message: "[SWOOPER_MOD] === placement plan apply ===" });
  emit({ type: "placement.start", message: `[SWOOPER_MOD] Map size: ${width}x${height}` });

  // Contract: deterministic plans are authoritative. Any partial stamp/rejection
  // is a hard failure for this step (full-stamp-or-fail semantics).

  const resolvedNaturalWonderPlan: DeepReadonly<PlanNaturalWondersOutput> = naturalWonderPlan ?? {
    width,
    height,
    wondersCount: 0,
    targetCount: 0,
    plannedCount: 0,
    placements: [],
  };
  const resolvedDiscoveryPlan: DeepReadonly<PlanDiscoveriesOutput> = discoveryPlan ?? {
    width,
    height,
    candidateDiscoveries: [],
    targetCount: 0,
    plannedCount: 0,
    placements: [],
  };
  const resolvedResourcePlan: DeepReadonly<PlanResourcesOutput> = resources ?? {
    width,
    height,
    candidateResourceTypes: [],
    targetCount: 0,
    plannedCount: 0,
    placements: [],
  };

  logTerrainStats(trace, adapter, width, height, "Initial");

  const wonderStamping = naturalWonderPlacement
    ? normalizeNaturalWonderStampingStats(naturalWonderPlacement)
    : runPlacementStep("placement.wonders", emit, () => {
        const stamping = stampNaturalWondersFromPlan({
          adapter,
          width,
          height,
          wonders: resolvedNaturalWonderPlan,
          requestedCount: wonders.wondersCount,
        });
        return stamping;
      });
  const wondersPlanned = wonderStamping.plannedCount;
  const wondersPlaced = wonderStamping.placedCount;
  emit({
    type: "placement.wonders.stamped",
    plannedCount: wonderStamping.plannedCount,
    placedCount: wonderStamping.placedCount,
    skippedOutOfBoundsCount: wonderStamping.skippedOutOfBoundsCount,
    rejectedCount: wonderStamping.rejectedCount,
  });

  runPlacementStep("placement.floodplains", emit, () => {
    adapter.addFloodplains(floodplains.minLength, floodplains.maxLength);
  });

  runPlacementStep("placement.terrain.validate", emit, () => {
    adapter.validateAndFixTerrain();
    emit({ type: "placement.terrain.validated" });
    logTerrainStats(trace, adapter, width, height, "After validateAndFixTerrain");
  });

  runPlacementStep("placement.areas.recalculate", emit, () => {
    adapter.recalculateAreas();
    emit({ type: "placement.areas.recalculated" });
  });

  runPlacementStep("placement.water.store", emit, () => {
    adapter.storeWaterData();
    emit({ type: "placement.water.stored" });
  });

  const slotByTile = landmassRegionSlotByTile.slotByTile;
  runPlacementStep("placement.landmassRegion.restamp", emit, () => {
    applyLandmassRegionSlots(adapter, width, height, slotByTile as Uint8Array);
    emit({ type: "placement.landmassRegion.restamped" });
  });

  const resourcesAttempted = true;
  const resourcePlacement = runPlacementStep("placement.resources", emit, () =>
    placeResourcesWithTypedOutcomes({
      adapter,
      width,
      height,
      resources: resolvedResourcePlan,
    })
  );
  publishResourcePlacementOutcomes(resourcePlacement);
  const resourcesPlaced = resourcePlacement.summary.placedCount;
  emit({
    type: "placement.resources.stamped",
    mode: "typed-intent",
    plannedCount: resourcePlacement.summary.plannedCount,
    placedCount: resourcePlacement.summary.placedCount,
    rejectedCount: resourcePlacement.summary.rejectedCount,
  });

  const startPositions: number[] = [];
  const startAssignment = runPlacementStep("placement.starts", emit, () =>
    assignStartPositions({
      context,
      starts,
      slotByTile: slotByTile as Uint8Array,
    })
  );
  startPositions.push(...startAssignment.positions);
  emit({
    type: "placement.starts.assigned",
    successCount: startAssignment.assigned,
    totalPlayers: startAssignment.positions.length,
    primaryAssigned: startAssignment.primaryAssigned,
    fallbackAssigned: startAssignment.fallbackAssigned,
    fallbackUsed: startAssignment.fallbackUsed,
  });

  emitStartSectorViz(context, slotByTile as Uint8Array, starts);
  emitStartPositionsViz(context, startPositions);

  const discoveryGeneration = runPlacementStep("placement.discoveries", emit, () =>
    placeDiscoveriesWithTypedOutcomes({
      adapter,
      width,
      height,
      discoveries: resolvedDiscoveryPlan,
    })
  );
  publishDiscoveryPlacementOutcomes(discoveryGeneration);
  const discoveriesPlanned = discoveryGeneration.summary.plannedCount;
  const discoveriesPlaced = discoveryGeneration.summary.placedCount;
  emit({
    type: "placement.discoveries.stamped",
    mode: "typed-intent",
    plannedCount: discoveryGeneration.summary.plannedCount,
    placedCount: discoveryGeneration.summary.placedCount,
    rejectedCount: discoveryGeneration.summary.rejectedCount,
  });

  runPlacementStep("placement.fertility.recalculate", emit, () => {
    adapter.recalculateFertility();
    emit({ type: "placement.fertility.recalculated" });
  });

  runPlacementStep("placement.advancedStart.assign", emit, () => {
    adapter.assignAdvancedStartRegions();
  });

  logTerrainStats(trace, adapter, width, height, "Final");
  logAsciiMap(trace, adapter, width, height);

  const slotCounts = { none: 0, west: 0, east: 0 };
  for (let i = 0; i < slotByTile.length; i++) {
    const slot = slotByTile[i] ?? 0;
    if (slot === 1) slotCounts.west += 1;
    else if (slot === 2) slotCounts.east += 1;
    else slotCounts.none += 1;
  }

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
        visibility: "debug",
      }),
    });
  }

  const startsAssigned = startPositions.filter((pos) => Number.isFinite(pos) && pos >= 0).length;
  publishEngineState({
    width,
    height,
    slotByTile: new Uint8Array(slotByTile),
    engineLandMask,
    slotCounts,
    startsAssigned,
    resourcesAttempted,
    resourcesPlaced,
    waterDriftCount,
    wondersPlanned,
    wondersPlaced,
    discoveriesPlanned,
    discoveriesPlaced,
  });

  emit({
    type: "placement.parity",
    slotCounts,
    wondersPlanned,
    wondersPlaced,
    resourcesAttempted,
    resourcesPlaced,
    discoveriesPlanned,
    discoveriesPlaced,
    waterDriftCount,
  });

  const outputs: PlacementOutputsV1 = {
    naturalWondersCount: wondersPlaced,
    floodplainsCount: 0,
    snowTilesCount: 0,
    resourcesCount: resourcesPlaced,
    startsAssigned,
    discoveriesCount: discoveriesPlaced,
  };

  return publishOutputs(outputs);
}

type StampNaturalWondersFromPlanArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  wonders: DeepReadonly<PlanNaturalWondersOutput>;
  requestedCount?: number;
};

export type NaturalWonderStampingStats = {
  plannedCount: number;
  placedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
};

/**
 * Stamps deterministic natural-wonder intent as its own placement product.
 *
 * Natural wonders have a concrete plan artifact and all-or-nothing materialized
 * effect. Keeping that verification here lets the recipe expose a standalone
 * step without duplicating Civ7 adapter policy in the domain planner.
 */
export function stampNaturalWondersFromPlan({
  adapter,
  width,
  height,
  wonders,
  requestedCount,
}: StampNaturalWondersFromPlanArgs): NaturalWonderStampingStats {
  if ((wonders.width | 0) !== (width | 0) || (wonders.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Natural wonder plan dimensions ${wonders.width}x${wonders.height} do not match map ${width}x${height}.`
    );
  }
  const plannedCount = wonders.placements.length;
  const declaredPlannedCount = Math.max(0, wonders.plannedCount | 0);
  const targetCount = Math.max(0, wonders.targetCount | 0);
  if (declaredPlannedCount !== plannedCount) {
    throw new Error(
      `[Placement] Natural wonder plan metadata mismatch (plannedCount=${declaredPlannedCount}, placements=${plannedCount}).`
    );
  }
  if (plannedCount < targetCount) {
    throw new Error(
      `[Placement] Natural wonder plan cannot satisfy target count (target=${targetCount}, planned=${plannedCount}).`
    );
  }
  const requested = Math.max(
    0,
    Number.isFinite(requestedCount) ? (requestedCount as number) | 0 : targetCount
  );
  if (requested !== plannedCount) {
    throw new Error(
      `[Placement] Natural wonder planner could not meet requested count (requested ${requested}, planned ${plannedCount}).`
    );
  }

  let placedCount = 0;
  let skippedOutOfBoundsCount = 0;
  let rejectedCount = 0;

  for (const placementPlan of wonders.placements) {
    if (!Number.isFinite(placementPlan.plotIndex)) {
      throw new Error(
        `[Placement] Natural wonder placement has invalid plotIndex (${String(placementPlan.plotIndex)}).`
      );
    }
    const plotIndex = placementPlan.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= width * height) {
      skippedOutOfBoundsCount += 1;
      continue;
    }

    if (!Number.isFinite(placementPlan.featureType) || !Number.isFinite(placementPlan.direction)) {
      throw new Error(
        `[Placement] Natural wonder placement at plot ${plotIndex} has invalid feature metadata (featureType=${String(placementPlan.featureType)}, direction=${String(placementPlan.direction)}).`
      );
    }
    if (placementPlan.elevation !== undefined && !Number.isFinite(placementPlan.elevation)) {
      throw new Error(
        `[Placement] Natural wonder placement at plot ${plotIndex} has invalid elevation (${String(placementPlan.elevation)}).`
      );
    }

    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    const placed = adapter.stampNaturalWonder(
      x,
      y,
      Math.trunc(placementPlan.featureType),
      Math.trunc(placementPlan.direction),
      Number.isFinite(placementPlan.elevation) ? placementPlan.elevation : undefined
    );
    if (placed) placedCount += 1;
    else rejectedCount += 1;
  }

  if (placedCount !== plannedCount || skippedOutOfBoundsCount > 0 || rejectedCount > 0) {
    throw new Error(
      `[Placement] Failed to stamp all natural wonders (placed ${placedCount}/${plannedCount}, target=${targetCount}, outOfBounds=${skippedOutOfBoundsCount}, rejected=${rejectedCount}).`
    );
  }

  return {
    plannedCount,
    placedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
  };
}

function normalizeNaturalWonderStampingStats(
  stats: DeepReadonly<NaturalWonderStampingStats>
): NaturalWonderStampingStats {
  const plannedCount = Math.max(0, stats.plannedCount | 0);
  const placedCount = Math.max(0, stats.placedCount | 0);
  const skippedOutOfBoundsCount = Math.max(0, stats.skippedOutOfBoundsCount | 0);
  const rejectedCount = Math.max(0, stats.rejectedCount | 0);
  if (placedCount !== plannedCount || skippedOutOfBoundsCount > 0 || rejectedCount > 0) {
    throw new Error(
      `[Placement] Natural wonder placement artifact is not fully satisfied (placed ${placedCount}/${plannedCount}, outOfBounds=${skippedOutOfBoundsCount}, rejected=${rejectedCount}).`
    );
  }
  return {
    plannedCount,
    placedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
  };
}

type PlaceResourcesWithTypedOutcomesArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  resources: DeepReadonly<PlanResourcesOutput>;
};

const RESOURCE_REJECTION_REASONS = new Set<string>([
  "out-of-bounds",
  "invalid-resource-type",
  "cannot-have-resource",
]);
const RESOURCE_MISMATCH_REASONS = new Set<string>(["wrong-resource-type"]);
const DISCOVERY_REJECTION_REASONS = new Set<string>([
  "out-of-bounds",
  "invalid-discovery-type",
  "adapter-rejected",
]);

function expectedTileForIntent(
  width: number,
  plotIndex: number
): { plotIndex: number; x: number; y: number } {
  const resolvedPlotIndex = Number.isFinite(plotIndex) ? Math.trunc(plotIndex) : -1;
  const y = width > 0 ? Math.trunc(resolvedPlotIndex / width) : -1;
  const x = width > 0 ? resolvedPlotIndex - y * width : -1;
  return { plotIndex: resolvedPlotIndex, x, y };
}

function summarizeResourceOutcomes(
  outcomes: readonly ResourcePlacementOutcome[]
): ResourcePlacementOutcomes["summary"] {
  let placedCount = 0;
  let rejectedCount = 0;
  let mismatchCount = 0;
  for (const outcome of outcomes) {
    if (outcome.status === "placed") placedCount += 1;
    else if (outcome.status === "rejected") rejectedCount += 1;
    else mismatchCount += 1;
  }
  return {
    plannedCount: outcomes.length,
    placedCount,
    rejectedCount,
    mismatchCount,
  };
}

function assertResourceOutcomeMatchesIntent(
  outcome: ResourcePlacementOutcome,
  intent: ResourcePlacementIntent,
  width: number
): void {
  const expected = expectedTileForIntent(width, intent.plotIndex);
  const expectedResourceType = Number.isFinite(intent.resourceType)
    ? Math.trunc(intent.resourceType)
    : -1;
  const status = (outcome as { status?: unknown }).status;

  if (status !== "placed" && status !== "rejected" && status !== "mismatch") {
    throw new Error(
      `[Placement] Resource placement returned untyped outcome status (${String(status)}).`
    );
  }
  if (
    outcome.plotIndex !== expected.plotIndex ||
    outcome.x !== expected.x ||
    outcome.y !== expected.y ||
    outcome.resourceType !== expectedResourceType
  ) {
    throw new Error(
      `[Placement] Resource placement outcome location/type drifted from intent (intent=${expected.plotIndex}:${expectedResourceType}, outcome=${outcome.plotIndex}:${outcome.resourceType}).`
    );
  }
  if (outcome.status === "rejected" && !RESOURCE_REJECTION_REASONS.has(outcome.reason)) {
    throw new Error(
      `[Placement] Resource placement returned an untyped rejection reason (${String(outcome.reason)}).`
    );
  }
  if (outcome.status === "mismatch" && !RESOURCE_MISMATCH_REASONS.has(outcome.reason)) {
    throw new Error(
      `[Placement] Resource placement returned an untyped mismatch reason (${String(outcome.reason)}).`
    );
  }
  if (
    outcome.status === "placed" &&
    (outcome.observedResourceType | 0) !== (expectedResourceType | 0)
  ) {
    throw new Error(
      `[Placement] Resource placement reported placed but readback differed (${expectedResourceType}->${outcome.observedResourceType}).`
    );
  }
}

/**
 * Materializes deterministic resource intent through the adapter and records
 * typed per-tile outcomes. Typed engine rejection is acceptable; wrong-type
 * readback is not, because that means projection no longer matches intent. The
 * runtime checks here intentionally guard the whole outcome category: every
 * returned outcome must match the planned location/type and carry a known
 * rejection/mismatch reason when it is not placed.
 */
function placeResourcesWithTypedOutcomes({
  adapter,
  width,
  height,
  resources,
}: PlaceResourcesWithTypedOutcomesArgs): ResourcePlacementOutcomes {
  if ((resources.width | 0) !== (width | 0) || (resources.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Resource plan dimensions ${resources.width}x${resources.height} do not match map ${width}x${height}.`
    );
  }

  const plannedCount = resources.placements.length;
  const declaredPlannedCount = Math.max(0, resources.plannedCount | 0);
  const targetCount = Math.max(0, resources.targetCount | 0);
  if (declaredPlannedCount !== plannedCount) {
    throw new Error(
      `[Placement] Resource plan metadata mismatch (plannedCount=${declaredPlannedCount}, placements=${plannedCount}).`
    );
  }
  if (plannedCount < targetCount) {
    throw new Error(
      `[Placement] Resource plan cannot satisfy target count (target=${targetCount}, planned=${plannedCount}).`
    );
  }

  const candidateResourceTypes = Array.from(
    new Set(
      resources.candidateResourceTypes
        .filter((value) => Number.isFinite(value))
        .map((value) => Math.trunc(value as number))
        .filter((value) => value >= 0)
    )
  );
  if (plannedCount > 0 && candidateResourceTypes.length === 0) {
    throw new Error(
      `[Placement] Resource plan has no candidate types for diagnostics (planned=${plannedCount}).`
    );
  }

  const outcomes: ResourcePlacementOutcome[] = [];
  for (const placement of resources.placements) {
    const intent = {
      plotIndex: placement.plotIndex,
      resourceType: placement.preferredResourceType,
    };
    const outcome = adapter.placeResourceIntent(width, height, intent);
    assertResourceOutcomeMatchesIntent(outcome, intent, width);
    outcomes.push(outcome);
  }

  const mismatches = outcomes.filter((outcome) => outcome.status === "mismatch");
  if (mismatches.length > 0) {
    const sample = mismatches
      .slice(0, 3)
      .map(
        (outcome) =>
          `${outcome.plotIndex}:${outcome.resourceType}->${outcome.observedResourceType} (${outcome.reason})`
      )
      .join(", ");
    throw new Error(
      `[Placement] Resource placement produced wrong-type readback for ${mismatches.length}/${outcomes.length} planned intents; sample: ${sample}.`
    );
  }

  return {
    summary: summarizeResourceOutcomes(outcomes),
    outcomes,
  };
}

type PlaceDiscoveriesWithTypedOutcomesArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  discoveries: DeepReadonly<PlanDiscoveriesOutput>;
};

function summarizeDiscoveryOutcomes(
  outcomes: readonly DiscoveryPlacementOutcome[]
): DiscoveryPlacementOutcomes["summary"] {
  let placedCount = 0;
  let rejectedCount = 0;
  for (const outcome of outcomes) {
    if (outcome.status === "placed") placedCount += 1;
    else rejectedCount += 1;
  }
  return {
    plannedCount: outcomes.length,
    placedCount,
    rejectedCount,
    mismatchCount: 0,
  };
}

function assertDiscoveryOutcomeMatchesIntent(
  outcome: DiscoveryPlacementOutcome,
  intent: DiscoveryPlacementIntent,
  width: number
): void {
  const expected = expectedTileForIntent(width, intent.plotIndex);
  const expectedVisualType = Number.isFinite(intent.discoveryVisualType)
    ? Math.trunc(intent.discoveryVisualType)
    : -1;
  const expectedActivationType = Number.isFinite(intent.discoveryActivationType)
    ? Math.trunc(intent.discoveryActivationType)
    : -1;
  const status = (outcome as { status?: unknown }).status;

  if (status !== "placed" && status !== "rejected") {
    throw new Error(
      `[Placement] Discovery placement returned untyped outcome status (${String(status)}).`
    );
  }
  if (
    outcome.plotIndex !== expected.plotIndex ||
    outcome.x !== expected.x ||
    outcome.y !== expected.y ||
    outcome.discoveryVisualType !== expectedVisualType ||
    outcome.discoveryActivationType !== expectedActivationType
  ) {
    throw new Error(
      `[Placement] Discovery placement outcome location/type drifted from intent (intent=${expected.plotIndex}:${expectedVisualType}/${expectedActivationType}, outcome=${outcome.plotIndex}:${outcome.discoveryVisualType}/${outcome.discoveryActivationType}).`
    );
  }
  if (outcome.status === "rejected" && !DISCOVERY_REJECTION_REASONS.has(outcome.reason)) {
    throw new Error(
      `[Placement] Discovery placement returned an untyped rejection reason (${String(outcome.reason)}).`
    );
  }
}

/**
 * Materializes deterministic discovery intent through the adapter and records
 * typed per-tile outcomes. The adapter cannot expose a richer Civ7 readback for
 * discoveries yet, so the only accepted non-placement state is a named adapter
 * rejection reason. As with resources, the recipe validates the whole outcome
 * category rather than trusting any adapter object that happens to be returned.
 */
function placeDiscoveriesWithTypedOutcomes({
  adapter,
  width,
  height,
  discoveries,
}: PlaceDiscoveriesWithTypedOutcomesArgs): DiscoveryPlacementOutcomes {
  if ((discoveries.width | 0) !== (width | 0) || (discoveries.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Discovery plan dimensions ${discoveries.width}x${discoveries.height} do not match map ${width}x${height}.`
    );
  }

  const plannedCount = discoveries.placements.length;
  const declaredPlannedCount = Math.max(0, discoveries.plannedCount | 0);
  const targetCount = Math.max(0, discoveries.targetCount | 0);
  if (declaredPlannedCount !== plannedCount) {
    throw new Error(
      `[Placement] Discovery plan metadata mismatch (plannedCount=${declaredPlannedCount}, placements=${plannedCount}).`
    );
  }
  if (plannedCount < targetCount) {
    throw new Error(
      `[Placement] Discovery plan cannot satisfy target count (target=${targetCount}, planned=${plannedCount}).`
    );
  }

  const outcomes: DiscoveryPlacementOutcome[] = [];
  for (const placement of discoveries.placements) {
    const intent = {
      plotIndex: placement.plotIndex,
      discoveryVisualType: placement.preferredDiscoveryVisualType,
      discoveryActivationType: placement.preferredDiscoveryActivationType,
    };
    const outcome = adapter.placeDiscoveryIntent(width, height, intent);
    assertDiscoveryOutcomeMatchesIntent(outcome, intent, width);
    outcomes.push(outcome);
  }

  return {
    summary: summarizeDiscoveryOutcomes(outcomes),
    outcomes,
  };
}

function applyLandmassRegionSlots(
  adapter: ExtendedMapContext["adapter"],
  width: number,
  height: number,
  slotByTile: Uint8Array
): void {
  const size = Math.max(0, (width | 0) * (height | 0));
  if (slotByTile.length !== size) {
    throw new Error(`Expected slotByTile length ${size} (received ${slotByTile.length}).`);
  }

  const westRegionId = adapter.getLandmassId("WEST");
  const eastRegionId = adapter.getLandmassId("EAST");
  const noneRegionId = adapter.getLandmassId("NONE");

  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    const slot = (slotByTile[i] ?? 0) as RegionSlot;
    const regionId = slot === 1 ? westRegionId : slot === 2 ? eastRegionId : noneRegionId;
    adapter.setLandmassRegionId(x, y, regionId);
  }
}

type AssignStartPositionsArgs = {
  context: ExtendedMapContext;
  starts: DeepReadonly<PlanStartsOutput>;
  slotByTile: Uint8Array;
};

function assignStartPositions({ context, starts, slotByTile }: AssignStartPositionsArgs): {
  positions: number[];
  assigned: number;
  primaryAssigned: number;
  fallbackAssigned: number;
  fallbackUsed: boolean;
} {
  const { adapter } = context;
  const { width, height } = context.dimensions;
  const playersWest = Math.max(0, starts.playersLandmass1 | 0);
  const playersEast = Math.max(0, starts.playersLandmass2 | 0);
  const totalPlayers = playersWest + playersEast;

  if (totalPlayers <= 0) {
    return {
      positions: new Array<number>(Math.max(0, totalPlayers)).fill(-1),
      assigned: 0,
      primaryAssigned: 0,
      fallbackAssigned: 0,
      fallbackUsed: false,
    };
  }

  const expected = Math.max(0, (width | 0) * (height | 0));
  if (slotByTile.length !== expected) {
    throw new Error(`Expected slotByTile length ${expected} (received ${slotByTile.length}).`);
  }

  const used = new Uint8Array(width * height);
  const positions = new Array<number>(totalPlayers).fill(-1);

  const westCandidates = collectCandidates(slotByTile, 1);
  const eastCandidates = collectCandidates(slotByTile, 2);
  const allCandidates = collectCandidates(slotByTile, null);

  const startSectors = Array.isArray(starts.startSectors) ? starts.startSectors : [];
  const sectorRows = Math.max(0, starts.startSectorRows | 0);
  const sectorCols = Math.max(0, starts.startSectorCols | 0);

  const selectForRegion = (
    region: "west" | "east",
    candidates: number[],
    count: number
  ): number[] => {
    if (count <= 0) return [];
    const filtered = filterCandidatesBySectors(
      candidates,
      width,
      height,
      sectorRows,
      sectorCols,
      startSectors,
      region
    );
    const pool = filtered.length ? filtered : candidates;
    return chooseStartTiles(pool, count, width, height, used);
  };

  const selectedWest = selectForRegion("west", westCandidates, playersWest);
  const selectedEast = selectForRegion("east", eastCandidates, playersEast);

  for (let i = 0; i < playersWest; i++) {
    positions[i] = selectedWest[i] ?? -1;
  }
  for (let i = 0; i < playersEast; i++) {
    positions[playersWest + i] = selectedEast[i] ?? -1;
  }

  let assigned = 0;
  for (let i = 0; i < positions.length; i++) {
    const plotIndex = positions[i] ?? -1;
    if (plotIndex >= 0) {
      adapter.setStartPosition(plotIndex, i);
      assigned++;
    }
  }
  const primaryAssigned = assigned;
  let fallbackAssigned = 0;
  let fallbackUsed = false;

  if (assigned < totalPlayers && allCandidates.length) {
    fallbackUsed = true;
    const remaining = totalPlayers - assigned;
    const fallback = chooseStartTiles(allCandidates, remaining, width, height, used);
    let writeIndex = 0;
    for (let i = 0; i < positions.length && writeIndex < fallback.length; i++) {
      if (positions[i] >= 0) continue;
      const plotIndex = fallback[writeIndex] ?? -1;
      positions[i] = plotIndex;
      if (plotIndex >= 0) {
        adapter.setStartPosition(plotIndex, i);
        assigned++;
        fallbackAssigned++;
      }
      writeIndex++;
    }
  }

  if (assigned !== totalPlayers) {
    throw new Error(
      `[Placement] Unable to assign all start positions after deterministic fallback (assigned ${assigned}/${totalPlayers}, westCandidates=${westCandidates.length}, eastCandidates=${eastCandidates.length}, allCandidates=${allCandidates.length}, primaryAssigned=${primaryAssigned}, fallbackAssigned=${fallbackAssigned}).`
    );
  }

  return { positions, assigned, primaryAssigned, fallbackAssigned, fallbackUsed };
}

function emitStartSectorViz(
  context: ExtendedMapContext,
  slotByTile: Uint8Array,
  starts: DeepReadonly<PlanStartsOutput>
): void {
  const { width, height } = context.dimensions;
  const rows = Math.max(0, starts.startSectorRows | 0);
  const cols = Math.max(0, starts.startSectorCols | 0);
  if (rows <= 0 || cols <= 0) return;
  const sectors = Array.isArray(starts.startSectors) ? starts.startSectors : [];

  const grid = buildStartSectorGrid({
    width,
    height,
    slotByTile,
    rows,
    cols,
    sectors,
  });
  if (!grid) return;

  context.viz?.dumpGrid(context.trace, {
    dataTypeKey: "placement.starts.sectorId",
    spaceId: "tile.hexOddR",
    dims: { width, height },
    format: "u16",
    values: grid,
    meta: defineVizMeta("placement.starts.sectorId", {
      label: "Start Sectors",
      group: GROUP_GAMEPLAY,
      description:
        "Derived start-sector grid for placement planning (0 = inactive). Values are sector ids.",
      palette: "categorical",
      visibility: "debug",
      categories: [{ value: 0, label: "Inactive", color: [148, 163, 184, 0] }],
    }),
  });
}

function buildStartSectorGrid(input: {
  width: number;
  height: number;
  slotByTile: Uint8Array;
  rows: number;
  cols: number;
  sectors: unknown[];
}): Uint16Array | null {
  const { width, height, slotByTile, rows, cols, sectors } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  if (slotByTile.length !== size) return null;

  const sectorsPerRegion = rows * cols;
  const usesSingleRegion = sectors.length === sectorsPerRegion;
  const usesDualRegion = sectors.length === sectorsPerRegion * 2;

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxCol = Math.max(1, cols);
  const maxRow = Math.max(1, rows);

  const out = new Uint16Array(size);
  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    const col = Math.min(maxCol - 1, Math.max(0, Math.floor(x / cellWidth)));
    const row = Math.min(maxRow - 1, Math.max(0, Math.floor(y / cellHeight)));
    const baseIndex = row * cols + col;

    let sectorIndex = baseIndex;
    if (usesDualRegion) {
      const slot = slotByTile[i] ?? 0;
      if (slot === 2) sectorIndex = baseIndex + sectorsPerRegion;
      if (slot !== 1 && slot !== 2) {
        out[i] = 0;
        continue;
      }
    }

    const isActive = usesSingleRegion || usesDualRegion ? Boolean(sectors[sectorIndex]) : true;
    out[i] = isActive ? baseIndex + 1 : 0;
  }

  return out;
}

function emitStartPositionsViz(context: ExtendedMapContext, startPositions: number[]): void {
  if (!startPositions.length) return;
  const { width, height } = context.dimensions;
  const valid = startPositions
    .map((plotIndex, playerIndex) => ({ plotIndex, playerIndex }))
    .filter((entry) => Number.isFinite(entry.plotIndex) && entry.plotIndex >= 0);
  if (!valid.length) return;

  const size = Math.max(0, (width | 0) * (height | 0));
  const grid = new Uint16Array(size);
  for (let i = 0; i < valid.length; i++) {
    const plotIndex = valid[i]!.plotIndex;
    if (plotIndex < 0 || plotIndex >= grid.length) continue;
    grid[plotIndex] = (valid[i]!.playerIndex ?? 0) + 1;
  }

  const positions = new Float32Array(valid.length * 2);
  const values = new Uint16Array(valid.length);
  for (let i = 0; i < valid.length; i++) {
    const { plotIndex, playerIndex } = valid[i]!;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    positions[i * 2] = x;
    positions[i * 2 + 1] = y;
    values[i] = playerIndex + 1;
  }

  const categories = Array.from({ length: startPositions.length }, (_, index) => ({
    value: index + 1,
    label: `Player ${index + 1}`,
    color: colorForStartPosition(index),
  }));
  const gridCategories = [
    { value: 0, label: "None", color: [148, 163, 184, 0] as [number, number, number, number] },
    ...categories,
  ];

  context.viz?.dumpGrid(context.trace, {
    dataTypeKey: "placement.starts.startPosition",
    spaceId: "tile.hexOddR",
    dims: { width, height },
    format: "u16",
    values: grid,
    meta: defineVizMeta("placement.starts.startPosition", {
      label: "Start Positions",
      group: GROUP_GAMEPLAY,
      role: "membership",
      categories: gridCategories,
      palette: "categorical",
    }),
  });

  context.viz?.dumpPoints(context.trace, {
    dataTypeKey: "placement.starts.startPosition",
    spaceId: "tile.hexOddR",
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.starts.startPosition", {
      label: "Start Positions",
      group: GROUP_GAMEPLAY,
      categories,
      palette: "categorical",
    }),
  });
}

function collectCandidates(slotByTile: Uint8Array, slot: number | null): number[] {
  const candidates: number[] = [];
  for (let i = 0; i < slotByTile.length; i++) {
    const value = slotByTile[i] ?? 0;
    if (slot === null) {
      if (value !== 0) candidates.push(i);
      continue;
    }
    if (value === slot) candidates.push(i);
  }
  return candidates;
}

function filterCandidatesBySectors(
  candidates: number[],
  width: number,
  height: number,
  rows: number,
  cols: number,
  sectors: unknown[],
  region: "west" | "east"
): number[] {
  if (rows <= 0 || cols <= 0) return candidates;
  const sectorsPerRegion = rows * cols;
  if (sectors.length !== sectorsPerRegion && sectors.length !== sectorsPerRegion * 2) {
    return candidates;
  }

  const offset =
    sectors.length === sectorsPerRegion * 2 && region === "east" ? sectorsPerRegion : 0;
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxCol = Math.max(1, cols);
  const maxRow = Math.max(1, rows);

  return candidates.filter((idx) => {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const col = Math.min(maxCol - 1, Math.max(0, Math.floor(x / cellWidth)));
    const row = Math.min(maxRow - 1, Math.max(0, Math.floor(y / cellHeight)));
    const sectorIndex = offset + row * cols + col;
    return Boolean(sectors[sectorIndex]);
  });
}

function chooseStartTiles(
  candidates: number[],
  count: number,
  width: number,
  height: number,
  used: Uint8Array
): number[] {
  if (count <= 0) return [];
  const available = candidates.filter((idx) => used[idx] !== 1);
  if (!available.length) return [];

  const seed = pickSeedTile(available, width, height);
  const selected: number[] = [];
  if (seed >= 0) {
    selected.push(seed);
    used[seed] = 1;
  }

  while (selected.length < count) {
    let bestIdx = -1;
    let bestDistance = -1;
    for (const idx of available) {
      if (used[idx] === 1) continue;
      const distance = minDistanceToSelection(idx, selected, width, height);
      if (distance > bestDistance) {
        bestDistance = distance;
        bestIdx = idx;
      }
    }
    if (bestIdx < 0) break;
    selected.push(bestIdx);
    used[bestIdx] = 1;
  }

  return selected;
}

function pickSeedTile(candidates: number[], width: number, height: number): number {
  if (!candidates.length) return -1;
  let sumX = 0;
  let sumY = 0;
  for (const idx of candidates) {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    sumX += x;
    sumY += y;
  }
  const centerX = sumX / candidates.length;
  const centerY = sumY / candidates.length;

  let bestIdx = candidates[0] ?? -1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const idx of candidates) {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const dx = x - centerX;
    const dy = y - centerY;
    const score = dx * dx + dy * dy;
    if (score < bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

function minDistanceToSelection(
  idx: number,
  selected: number[],
  width: number,
  height: number
): number {
  if (!selected.length) return Infinity;
  let best = Infinity;
  for (const other of selected) {
    const dist = hexDistanceOddQ(idx, other, width, height);
    if (dist < best) best = dist;
  }
  return best;
}

function hexDistanceOddQ(aIndex: number, bIndex: number, width: number, _height: number): number {
  const ay = (aIndex / width) | 0;
  const ax = aIndex - ay * width;
  const by = (bIndex / width) | 0;
  const bx = bIndex - by * width;
  const wrappedBx = ax + wrapDeltaPeriodic(bx - ax, width);
  const aCube = oddqToCube(ax, ay);
  const bCube = oddqToCube(wrappedBx, by);
  const dx = Math.abs(aCube.x - bCube.x);
  const dy = Math.abs(aCube.y - bCube.y);
  const dz = Math.abs(aCube.z - bCube.z);
  return Math.max(dx, dy, dz);
}

function oddqToCube(x: number, y: number): { x: number; y: number; z: number } {
  const z = y - (x - (x & 1)) / 2;
  const xCube = x;
  const zCube = z;
  const yCube = -xCube - zCube;
  return { x: xCube, y: yCube, z: zCube };
}

function logTerrainStats(
  trace: TraceScope | null | undefined,
  adapter: ExtendedMapContext["adapter"],
  width: number,
  height: number,
  stage: string
): void {
  if (!trace?.isVerbose) return;
  let flat = 0;
  let hill = 0;
  let mtn = 0;
  let water = 0;
  const total = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (adapter.isWater(x, y)) {
        water++;
        continue;
      }
      const t = adapter.getTerrainType(x, y);
      if (t === MOUNTAIN_TERRAIN) mtn++;
      else if (t === HILL_TERRAIN) hill++;
      else flat++;
    }
  }

  const land = Math.max(1, flat + hill + mtn);
  trace.event(() => ({
    type: "placement.terrainStats",
    stage,
    totals: {
      water: Number(((water / total) * 100).toFixed(1)),
      land: Number(((land / total) * 100).toFixed(1)),
      landTiles: land,
    },
    shares: {
      mountains: Number(((mtn / land) * 100).toFixed(1)),
      hills: Number(((hill / land) * 100).toFixed(1)),
      flat: Number(((flat / land) * 100).toFixed(1)),
    },
  }));
}

function logAsciiMap(
  trace: TraceScope | null | undefined,
  adapter: ExtendedMapContext["adapter"],
  width: number,
  height: number
): void {
  if (!trace?.isVerbose) return;
  const lines: string[] = ["[Placement] Final Map ASCII:"];

  for (let y = height - 1; y >= 0; y--) {
    let row = "";
    if (y % 2 !== 0) row += " ";
    for (let x = 0; x < width; x++) {
      const t = adapter.getTerrainType(x, y);
      row += getTerrainSymbol(t) + " ";
    }
    lines.push(row);
  }

  trace.event(() => ({ type: "placement.ascii", lines }));
}
