import type {
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
} from "@civ7/adapter";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";
import { getInitialMapResourcePolicyForStaticSlot } from "../../../../../../domain/resources/initial-map-authoring-policy.js";

type PlanResourcesOutput = Static<(typeof placement.ops.planResources)["output"]>;
type ResourcePlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["resourcePlacementOutcomes"]["schema"]
>;
type ResourcePlacementReason = ResourcePlacementRejectionReason | ResourcePlacementMismatchReason;
type ResourcePlacementSummary = ResourcePlacementOutcomes["summary"];
type ResourceAssignmentSummary = ResourcePlacementOutcomes["assignment"];
type RuntimeResourceCatalogEntry = {
  readonly index: number;
  readonly resourceType: string;
  readonly resourceClassType: string | null;
  readonly name: string | null;
};
type RuntimeResourceRow = {
  readonly Index?: unknown;
  readonly $index?: unknown;
  readonly ResourceType?: unknown;
  readonly ResourceClassType?: unknown;
  readonly Name?: unknown;
};

type PlaceResourcesWithTypedOutcomesArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  resources: DeepReadonly<PlanResourcesOutput>;
};
type ResourceAssignment = {
  plotIndex: number;
  resourceType: number;
  preferredResourceType: number | null;
};
type PlacementCandidate = {
  plotIndex: number;
  preferredResourceType: number;
  preferredTypeOffset: number;
  priority: number;
};
type ResourceAssignmentResult = {
  assignments: ResourceAssignment[];
  assignment: ResourceAssignmentSummary;
};

const RESOURCE_REJECTION_REASONS = new Set<string>([
  "out-of-bounds",
  "invalid-resource-type",
  "cannot-have-resource",
]);
const RESOURCE_MISMATCH_REASONS = new Set<string>(["wrong-resource-type"]);

function expectedTileForIntent(
  width: number,
  plotIndex: number
): { plotIndex: number; x: number; y: number } {
  const resolvedPlotIndex = Number.isFinite(plotIndex) ? Math.trunc(plotIndex) : -1;
  const y = width > 0 ? Math.trunc(resolvedPlotIndex / width) : -1;
  const x = width > 0 ? resolvedPlotIndex - y * width : -1;
  return { plotIndex: resolvedPlotIndex, x, y };
}

function isLegalResourceTile(
  adapter: ExtendedMapContext["adapter"],
  width: number,
  height: number,
  plotIndex: number,
  resourceType: number
): boolean {
  const tile = expectedTileForIntent(width, plotIndex);
  if (tile.x < 0 || tile.y < 0 || tile.x >= width || tile.y >= height) return false;
  return adapter.canHaveResource(tile.x, tile.y, resourceType);
}

function allPlotIndices(size: number): number[] {
  return Array.from({ length: size }, (_value, index) => index);
}

function buildCandidatePlotOrder(placements: readonly PlacementCandidate[], size: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const placement of placements) {
    const plotIndex = Math.trunc(placement.plotIndex);
    if (plotIndex < 0 || plotIndex >= size || seen.has(plotIndex)) continue;
    seen.add(plotIndex);
    order.push(plotIndex);
  }
  for (const plotIndex of allPlotIndices(size)) {
    if (seen.has(plotIndex)) continue;
    order.push(plotIndex);
  }
  return order;
}

function buildPreferredResourceByPlot(
  placements: readonly PlacementCandidate[],
  size: number
): Map<number, number> {
  const byPlot = new Map<number, number>();
  for (const placement of placements) {
    const plotIndex = Math.trunc(placement.plotIndex);
    if (plotIndex < 0 || plotIndex >= size || byPlot.has(plotIndex)) continue;
    byPlot.set(plotIndex, Math.trunc(placement.preferredResourceType));
  }
  return byPlot;
}

function chooseLeastUsedLegalResource(args: {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  plotIndex: number;
  candidateResourceTypes: readonly number[];
  perTypeCounts: ReadonlyMap<number, number>;
}): number | null {
  let bestType: number | null = null;
  let bestCount = Number.POSITIVE_INFINITY;
  for (const resourceType of args.candidateResourceTypes) {
    if (
      !isLegalResourceTile(args.adapter, args.width, args.height, args.plotIndex, resourceType)
    ) {
      continue;
    }
    const count = args.perTypeCounts.get(resourceType) ?? 0;
    if (count < bestCount || (count === bestCount && (bestType === null || resourceType < bestType))) {
      bestType = resourceType;
      bestCount = count;
    }
  }
  return bestType;
}

function describeResourceType(resourceType: number): string {
  const policy = getInitialMapResourcePolicyForStaticSlot(resourceType);
  return policy
    ? `${resourceType}:${policy.resourceType}:${policy.status}`
    : `${resourceType}:unknown`;
}

function assertInitialMapEligibleResourceTypes(args: {
  candidateResourceTypes: readonly number[];
  placements: readonly { preferredResourceType: number }[];
}): void {
  const invalidCandidates = args.candidateResourceTypes.filter(
    (resourceType) =>
      getInitialMapResourcePolicyForStaticSlot(resourceType)?.status !== "eligible"
  );
  const invalidPreferred = args.placements
    .map((placement) => Math.trunc(placement.preferredResourceType))
    .filter(
      (resourceType) =>
        getInitialMapResourcePolicyForStaticSlot(resourceType)?.status !== "eligible"
    );
  const invalid = Array.from(new Set([...invalidCandidates, ...invalidPreferred])).sort(
    (a, b) => a - b
  );

  if (invalid.length > 0) {
    throw new Error(
      `[Placement] Resource plan includes non-initial-map resource ids: ${invalid
        .map(describeResourceType)
        .join(", ")}.`
    );
  }
}

function assignResourceIntents(args: {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  resources: DeepReadonly<PlanResourcesOutput>;
  candidateResourceTypes: readonly number[];
}): ResourceAssignmentResult {
  const size = Math.max(0, args.width * args.height);
  const targetCount = Math.min(args.resources.placements.length, size);
  const plannedPlacements = args.resources.placements.map((placement) => ({
    plotIndex: Math.trunc(placement.plotIndex),
    preferredResourceType: Math.trunc(placement.preferredResourceType),
    preferredTypeOffset: Math.trunc(placement.preferredTypeOffset),
    priority: placement.priority,
  }));
  const plotOrder = buildCandidatePlotOrder(plannedPlacements, size);
  const preferredByPlot = buildPreferredResourceByPlot(plannedPlacements, size);
  const usedPlots = new Set<number>();
  const perTypeCounts = new Map<number, number>();
  const assignments: ResourceAssignment[] = [];

  const addAssignment = (plotIndex: number, resourceType: number): void => {
    usedPlots.add(plotIndex);
    perTypeCounts.set(resourceType, (perTypeCounts.get(resourceType) ?? 0) + 1);
    assignments.push({
      plotIndex,
      resourceType,
      preferredResourceType: preferredByPlot.get(plotIndex) ?? null,
    });
  };

  for (const resourceType of args.candidateResourceTypes) {
    if (assignments.length >= targetCount) break;
    const plotIndex = plotOrder.find(
      (candidatePlot) =>
        !usedPlots.has(candidatePlot) &&
        isLegalResourceTile(args.adapter, args.width, args.height, candidatePlot, resourceType)
    );
    if (plotIndex === undefined) continue;
    addAssignment(plotIndex, resourceType);
  }

  for (const placement of args.resources.placements) {
    if (assignments.length >= targetCount) break;
    const plotIndex = Math.trunc(placement.plotIndex);
    if (plotIndex < 0 || plotIndex >= size || usedPlots.has(plotIndex)) continue;
    const resourceType = chooseLeastUsedLegalResource({
      adapter: args.adapter,
      width: args.width,
      height: args.height,
      plotIndex,
      candidateResourceTypes: args.candidateResourceTypes,
      perTypeCounts,
    });
    if (resourceType === null) continue;
    addAssignment(plotIndex, resourceType);
  }

  for (const plotIndex of plotOrder) {
    if (assignments.length >= targetCount) break;
    if (usedPlots.has(plotIndex)) continue;
    const resourceType = chooseLeastUsedLegalResource({
      adapter: args.adapter,
      width: args.width,
      height: args.height,
      plotIndex,
      candidateResourceTypes: args.candidateResourceTypes,
      perTypeCounts,
    });
    if (resourceType === null) continue;
    addAssignment(plotIndex, resourceType);
  }

  return {
    assignments,
    assignment: summarizeResourceAssignments({
      adapter: args.adapter,
      width: args.width,
      height: args.height,
      size,
      plannedPlacements,
      assignments,
      candidateResourceTypes: args.candidateResourceTypes,
      plotOrder,
      usedPlots,
    }),
  };
}

function summarizeResourceAssignments(args: {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  size: number;
  plannedPlacements: readonly PlacementCandidate[];
  assignments: readonly ResourceAssignment[];
  candidateResourceTypes: readonly number[];
  plotOrder: readonly number[];
  usedPlots: ReadonlySet<number>;
}): ResourceAssignmentSummary {
  const byResource = new Map<
    number,
    {
      plannedCount: number;
      assignedCount: number;
      reassignedOutCount: number;
      reassignedInCount: number;
      unassignedCount: number;
    }
  >();
  const ensure = (resourceType: number) => {
    let row = byResource.get(resourceType);
    if (!row) {
      row = {
        plannedCount: 0,
        assignedCount: 0,
        reassignedOutCount: 0,
        reassignedInCount: 0,
        unassignedCount: 0,
      };
      byResource.set(resourceType, row);
    }
    return row;
  };

  for (const resourceType of args.candidateResourceTypes) ensure(resourceType);
  for (const placement of args.plannedPlacements) {
    ensure(placement.preferredResourceType).plannedCount += 1;
  }

  let reassignedCount = 0;
  for (const assignment of args.assignments) {
    ensure(assignment.resourceType).assignedCount += 1;
    if (
      assignment.preferredResourceType !== null &&
      assignment.preferredResourceType !== assignment.resourceType
    ) {
      reassignedCount += 1;
      ensure(assignment.preferredResourceType).reassignedOutCount += 1;
      ensure(assignment.resourceType).reassignedInCount += 1;
    }
  }

  for (const placement of args.plannedPlacements) {
    const plotIndex = Math.trunc(placement.plotIndex);
    if (plotIndex < 0 || plotIndex >= args.size || args.usedPlots.has(plotIndex)) continue;
    ensure(placement.preferredResourceType).unassignedCount += 1;
  }

  const legalCandidateResourceTypes = args.candidateResourceTypes.filter((resourceType) =>
    args.plotOrder.some((plotIndex) =>
      isLegalResourceTile(args.adapter, args.width, args.height, plotIndex, resourceType)
    )
  );
  const legalSet = new Set(legalCandidateResourceTypes);
  const unassignableResourceTypes = args.candidateResourceTypes.filter(
    (resourceType) => !legalSet.has(resourceType)
  );
  const unassignedPreferredCount = Array.from(byResource.values()).reduce(
    (sum, row) => sum + row.unassignedCount,
    0
  );

  return {
    requestedPlannedCount: args.plannedPlacements.length,
    assignedCount: args.assignments.length,
    reassignedCount,
    unassignedPreferredCount,
    candidateResourceTypes: [...args.candidateResourceTypes],
    legalCandidateResourceTypes,
    unassignableResourceTypes,
    byPreferredResource: Array.from(byResource.entries())
      .sort(([a], [b]) => a - b)
      .map(([resourceType, row]) => ({ resourceType, ...row })),
  };
}

function summarizeResourceOutcomes(
  outcomes: readonly ResourcePlacementOutcome[]
): ResourcePlacementOutcomes["summary"] {
  let placedCount = 0;
  let rejectedCount = 0;
  let mismatchCount = 0;
  const byResource = new Map<
    number,
    {
      plannedCount: number;
      placedCount: number;
      rejectedCount: number;
      mismatchCount: number;
      reasons: Map<ResourcePlacementReason, number>;
    }
  >();
  const byReason = new Map<ResourcePlacementReason, number>();

  for (const outcome of outcomes) {
    const resourceType = Number.isFinite(outcome.resourceType)
      ? Math.trunc(outcome.resourceType)
      : -1;
    let resourceSummary = byResource.get(resourceType);
    if (!resourceSummary) {
      resourceSummary = {
        plannedCount: 0,
        placedCount: 0,
        rejectedCount: 0,
        mismatchCount: 0,
        reasons: new Map(),
      };
      byResource.set(resourceType, resourceSummary);
    }
    resourceSummary.plannedCount += 1;

    if (outcome.status === "placed") {
      placedCount += 1;
      resourceSummary.placedCount += 1;
    } else if (outcome.status === "rejected") {
      rejectedCount += 1;
      resourceSummary.rejectedCount += 1;
    } else {
      mismatchCount += 1;
      resourceSummary.mismatchCount += 1;
    }

    if (outcome.status !== "placed") {
      const reason = outcome.reason;
      resourceSummary.reasons.set(reason, (resourceSummary.reasons.get(reason) ?? 0) + 1);
      byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
    }
  }
  return {
    plannedCount: outcomes.length,
    placedCount,
    rejectedCount,
    mismatchCount,
    byResource: Array.from(byResource.entries())
      .sort(([a], [b]) => a - b)
      .map(([resourceType, summary]) => ({
        resourceType,
        plannedCount: summary.plannedCount,
        placedCount: summary.placedCount,
        rejectedCount: summary.rejectedCount,
        mismatchCount: summary.mismatchCount,
        reasons: Array.from(summary.reasons.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([reason, count]) => ({ reason, count })),
      })),
    byReason: Array.from(byReason.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([reason, count]) => ({ reason, count })),
  };
}

function coerceRuntimeIndex(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : null;
}

function coerceRuntimeString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function readRuntimeResourceCatalog(): readonly RuntimeResourceCatalogEntry[] {
  const runtime = globalThis as typeof globalThis & {
    GameInfo?: { Resources?: Iterable<RuntimeResourceRow> };
  };
  const table = runtime.GameInfo?.Resources;
  if (!table) return [];

  return Array.from(table)
    .map((row) => {
      const index = coerceRuntimeIndex(row.Index) ?? coerceRuntimeIndex(row.$index);
      const resourceType = coerceRuntimeString(row.ResourceType);
      if (index === null || resourceType === null) return null;
      return {
        index,
        resourceType,
        resourceClassType: coerceRuntimeString(row.ResourceClassType),
        name: coerceRuntimeString(row.Name),
      };
    })
    .filter((row): row is RuntimeResourceCatalogEntry => row !== null)
    .sort((a, b) => a.index - b.index);
}

export function buildResourcePlacementRuntimeTelemetry(
  summary: ResourcePlacementSummary,
  assignment?: ResourceAssignmentSummary,
  runtimeCatalog: readonly RuntimeResourceCatalogEntry[] = readRuntimeResourceCatalog()
): Record<string, unknown> {
  const runtimeByIndex = new Map(runtimeCatalog.map((row) => [row.index, row]));
  const plannedResourceTypes = summary.byResource.filter((row) => row.plannedCount > 0);
  const placedResourceTypes = summary.byResource.filter((row) => row.placedCount > 0);
  const rejectedResourceTypes = summary.byResource.filter((row) => row.rejectedCount > 0);
  const placedCounts = placedResourceTypes.map((row) => row.placedCount);
  const unmappedResourceTypes = summary.byResource.filter(
    (row) => row.placedCount > 0 && !runtimeByIndex.has(row.resourceType)
  );

  return {
    version: 1,
    plannedCount: summary.plannedCount,
    placedCount: summary.placedCount,
    rejectedCount: summary.rejectedCount,
    mismatchCount: summary.mismatchCount,
    uniquePlannedTypes: plannedResourceTypes.length,
    uniquePlacedTypes: placedResourceTypes.length,
    minPlacedCountByType: placedCounts.length > 0 ? Math.min(...placedCounts) : 0,
    maxPlacedCountByType: placedCounts.length > 0 ? Math.max(...placedCounts) : 0,
    runtimeCatalogCount: runtimeCatalog.length,
    plannedResourceTypes: plannedResourceTypes.map((row) => row.resourceType),
    placedResourceTypes: placedResourceTypes.map((row) => row.resourceType),
    rejectedResourceTypes: rejectedResourceTypes.map((row) => row.resourceType),
    unmappedPlacedResourceTypes: unmappedResourceTypes.map((row) => row.resourceType),
    ...(assignment
      ? {
          assignment: {
            requestedPlannedCount: assignment.requestedPlannedCount,
            assignedCount: assignment.assignedCount,
            reassignedCount: assignment.reassignedCount,
            unassignedPreferredCount: assignment.unassignedPreferredCount,
            candidateResourceTypeCount: assignment.candidateResourceTypes.length,
            legalCandidateResourceTypeCount: assignment.legalCandidateResourceTypes.length,
            unassignableResourceTypes: assignment.unassignableResourceTypes,
          },
        }
      : {}),
    byReason: summary.byReason,
  };
}

export function logResourcePlacementRuntimeTelemetry(
  summary: ResourcePlacementSummary,
  assignment: ResourceAssignmentSummary
): void {
  const runtimeCatalog = readRuntimeResourceCatalog();
  if (runtimeCatalog.length === 0) return;
  console.log(
    `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(
      buildResourcePlacementRuntimeTelemetry(summary, assignment, runtimeCatalog)
    )}`
  );
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
 * typed per-tile outcomes.
 *
 * Resource placement is an engine-bound product effect, so this file lives with
 * the `place-resources` step. The guard validates every returned outcome
 * against the planned location/type instead of accepting one-off success cases
 * or adapter objects with untyped rejection reasons.
 */
export function placeResourcesWithTypedOutcomes({
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
  assertInitialMapEligibleResourceTypes({
    candidateResourceTypes,
    placements: resources.placements,
  });

  const assignmentResult = assignResourceIntents({
    adapter,
    width,
    height,
    resources,
    candidateResourceTypes,
  });
  if (plannedCount > 0 && assignmentResult.assignments.length === 0) {
    throw new Error(
      `[Placement] Resource placement found no engine-legal resource assignments for ${plannedCount} planned intents.`
    );
  }

  const outcomes: ResourcePlacementOutcome[] = [];
  for (const assignment of assignmentResult.assignments) {
    const intent = {
      plotIndex: assignment.plotIndex,
      resourceType: assignment.resourceType,
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
    assignment: assignmentResult.assignment,
    outcomes,
  };
}
