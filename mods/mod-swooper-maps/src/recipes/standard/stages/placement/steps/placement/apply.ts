import type { ExtendedMapContext, TraceScope } from "@swooper/mapgen-core";
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

type PlanFloodplainsOutput = Static<typeof placement.ops.planFloodplains["output"]>;
type PlanDiscoveriesOutput = Static<typeof placement.ops.planDiscoveries["output"]>;
type PlanNaturalWondersOutput = Static<typeof placement.ops.planNaturalWonders["output"]>;
type PlanResourcesOutput = Static<typeof placement.ops.planResources["output"]>;
type PlanStartsOutput = Static<typeof placement.ops.planStarts["output"]>;
type PlanWondersOutput = Static<typeof placement.ops.planWonders["output"]>;

type LandmassRegionSlotByTile = Static<
  (typeof import("../../../../map-artifacts.js").mapArtifacts)["landmassRegionSlotByTile"]["schema"]
>;
type EngineTerrainSnapshot = Static<
  (typeof import("../../../../map-artifacts.js").mapArtifacts)["placementEngineTerrainSnapshot"]["schema"]
>;
type PlacementEngineState = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["engineState"]["schema"]
>;

type ApplyPlacementArgs = {
  context: ExtendedMapContext;
  starts: DeepReadonly<PlanStartsOutput>;
  wonders: DeepReadonly<PlanWondersOutput>;
  naturalWonderPlan: DeepReadonly<PlanNaturalWondersOutput>;
  discoveryPlan: DeepReadonly<PlanDiscoveriesOutput>;
  floodplains: DeepReadonly<PlanFloodplainsOutput>;
  resources: DeepReadonly<PlanResourcesOutput>;
  landmassRegionSlotByTile: DeepReadonly<LandmassRegionSlotByTile>;
  publishOutputs: (outputs: PlacementOutputsV1) => DeepReadonly<PlacementOutputsV1>;
  publishEngineState?: (engineState: PlacementEngineState) => DeepReadonly<PlacementEngineState>;
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
  naturalWonderPlan,
  discoveryPlan,
  floodplains,
  resources,
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

  const wonderStamping = runPlacementStep("placement.wonders", emit, () => {
    const stamping = stampNaturalWondersFromPlan({
      adapter,
      width,
      height,
      wonders: resolvedNaturalWonderPlan,
    });
    const requestedCount = Math.max(0, wonders.wondersCount | 0);
    if (requestedCount !== (stamping.plannedCount | 0)) {
      throw new Error(
        `[Placement] Natural wonder planner could not meet requested count (requested ${requestedCount}, planned ${stamping.plannedCount}).`
      );
    }
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
  // Runtime posture: resources are generated via official Civ path for age-valid
  // eligibility behavior. Deterministic resource planning remains a non-primary
  // artifact surface and is currently parity-incomplete by design.
  const resourceGeneration = runPlacementStep("placement.resources", emit, () =>
    generateResourcesWithOfficialPrimary({
      adapter,
      width,
      height,
      resources: resolvedResourcePlan,
    })
  );
  const resourcesPlaced = resourceGeneration.placedCount;
  emit({
    type: "placement.resources.mode",
    mode: resourceGeneration.mode,
    minMarineResourceTypesOverride: resourceGeneration.minMarineResourceTypesOverride ?? null,
  });
  emit({
    type: "placement.resources.stamped",
    mode: resourceGeneration.mode,
    plannedCount: resourceGeneration.plannedCount,
    placedCount: resourceGeneration.placedCount,
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

  const discoveryPolarMargin = resolveDiscoveryPolarMargin(context);
  const discoveryGeneration = runPlacementStep("placement.discoveries", emit, () =>
    generateDiscoveriesWithOfficialFallback({
      adapter,
      width,
      height,
      discoveries: resolvedDiscoveryPlan,
      startPositions,
      polarMargin: discoveryPolarMargin,
    })
  );
  const discoveriesPlanned = discoveryGeneration.plannedCount;
  const discoveriesPlaced = discoveryGeneration.placedCount;
  emit({
    type: "placement.discoveries.mode",
    mode: discoveryGeneration.mode,
    startPositionsCount: discoveryGeneration.startPositionsCount,
    polarMargin: discoveryGeneration.polarMargin,
  });
  emit({
    type: "placement.discoveries.stamped",
    mode: discoveryGeneration.mode,
    plannedCount: discoveryGeneration.plannedCount,
    placedCount: discoveryGeneration.placedCount,
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
  const engineLandMask = engineSnapshot ? engineSnapshot.landMask : new Uint8Array(physics.landMask);
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
};

type NaturalWonderStampingStats = {
  plannedCount: number;
  placedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
};

function stampNaturalWondersFromPlan({
  adapter,
  width,
  height,
  wonders,
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

type GenerateDiscoveriesWithOfficialFallbackArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  discoveries: DeepReadonly<PlanDiscoveriesOutput>;
  startPositions: ReadonlyArray<number>;
  polarMargin: number;
};

type OfficialDiscoveryGenerationStats = {
  mode: "official-fallback";
  plannedCount: number;
  placedCount: number;
  startPositionsCount: number;
  polarMargin: number;
};

function resolveDiscoveryPolarMargin(context: ExtendedMapContext): number {
  const globalPolarRows = (
    globalThis as typeof globalThis & {
      g_PolarWaterRows?: unknown;
    }
  ).g_PolarWaterRows;
  if (Number.isFinite(globalPolarRows)) return Math.max(0, Math.trunc(globalPolarRows as number));
  return 0;
}

function sanitizeStartPositions(values: ReadonlyArray<number>): number[] {
  return (Array.isArray(values) ? values : [])
    .filter((value) => Number.isFinite(value) && value >= 0)
    .map((value) => Math.trunc(value));
}

function generateDiscoveriesWithOfficialFallback({
  adapter,
  width,
  height,
  discoveries,
  startPositions,
  polarMargin,
}: GenerateDiscoveriesWithOfficialFallbackArgs): OfficialDiscoveryGenerationStats {
  if ((discoveries.width | 0) !== (width | 0) || (discoveries.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Discovery plan dimensions ${discoveries.width}x${discoveries.height} do not match map ${width}x${height}.`
    );
  }

  const plannedCount = Number.isFinite(discoveries.plannedCount)
    ? Math.max(0, Math.trunc(discoveries.plannedCount))
    : Math.max(0, discoveries.placements.length | 0);
  const resolvedPolarMargin = Number.isFinite(polarMargin) ? Math.max(0, Math.trunc(polarMargin)) : 0;
  const resolvedStartPositions = sanitizeStartPositions(startPositions);
  const placedCount = adapter.generateOfficialDiscoveries(
    width,
    height,
    resolvedStartPositions,
    resolvedPolarMargin
  );
  if (!Number.isFinite(placedCount) || placedCount < 0) {
    throw new Error(
      `[Placement] Official discovery generator returned invalid placed count (${String(placedCount)}).`
    );
  }
  const resolvedPlacedCount = Math.trunc(placedCount);
  if (resolvedPlacedCount !== plannedCount) {
    throw new Error(
      `[Placement] Official discovery generator placed ${resolvedPlacedCount} discoveries but plan requires ${plannedCount}.`
    );
  }

  return {
    mode: "official-fallback",
    plannedCount,
    placedCount: resolvedPlacedCount,
    startPositionsCount: resolvedStartPositions.length,
    polarMargin: resolvedPolarMargin,
  };
}

type GenerateResourcesWithOfficialPrimaryArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  resources: DeepReadonly<PlanResourcesOutput>;
  minMarineResourceTypesOverride?: number;
};

type OfficialResourceGenerationStats = {
  mode: "official-primary";
  plannedCount: number;
  placedCount: number;
  minMarineResourceTypesOverride?: number;
};

function generateResourcesWithOfficialPrimary({
  adapter,
  width,
  height,
  resources,
  minMarineResourceTypesOverride,
}: GenerateResourcesWithOfficialPrimaryArgs): OfficialResourceGenerationStats {
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

  const resolvedMinMarineResourceTypesOverride = Number.isFinite(minMarineResourceTypesOverride)
    ? Math.max(0, Math.trunc(minMarineResourceTypesOverride as number))
    : undefined;
  const placedCount = adapter.generateOfficialResources(
    width,
    height,
    resolvedMinMarineResourceTypesOverride
  );
  if (!Number.isFinite(placedCount) || placedCount < 0) {
    throw new Error(
      `[Placement] Official resource generator returned invalid placed count (placedCount=${String(placedCount)}, planned=${plannedCount}, target=${targetCount}, minMarineResourceTypesOverride=${String(resolvedMinMarineResourceTypesOverride)}).`
    );
  }

  return {
    mode: "official-primary",
    plannedCount,
    placedCount: Math.trunc(placedCount),
    minMarineResourceTypesOverride: resolvedMinMarineResourceTypesOverride,
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

function assignStartPositions({
  context,
  starts,
  slotByTile,
}: AssignStartPositionsArgs): {
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

function emitStartPositionsViz(
  context: ExtendedMapContext,
  startPositions: number[]
): void {
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

function collectCandidates(
  slotByTile: Uint8Array,
  slot: number | null
): number[] {
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

  const offset = sectors.length === sectorsPerRegion * 2 && region === "east" ? sectorsPerRegion : 0;
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

function hexDistanceOddQ(
  aIndex: number,
  bIndex: number,
  width: number,
  _height: number
): number {
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
