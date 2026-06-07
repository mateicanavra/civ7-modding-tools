import type {
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
} from "@civ7/adapter";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";
import { buildDispersedGridOrder, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import placement from "@mapgen/domain/placement";
import {
  getInitialMapResourcePolicyForStaticSlot,
  resolveActiveResourceAge,
  type OfficialAgeType,
} from "../../../../../../domain/resources/index.js";

type PlanResourcesOutput = Static<(typeof placement.ops.planResources)["output"]>;
type ResourcePlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["resourcePlacementOutcomes"]["schema"]
>;
type ResourcePlacementReason = ResourcePlacementRejectionReason | ResourcePlacementMismatchReason;
type ResourcePlacementSummary = ResourcePlacementOutcomes["summary"];
type ResourceAssignmentSummary = ResourcePlacementOutcomes["assignment"];
type ResourcePlacementRuntimeTelemetryOutcome = ResourcePlacementOutcomes["outcomes"][number];
type ResourcePlacementRuntimeRejectionExample = {
  readonly status: Exclude<ResourcePlacementRuntimeTelemetryOutcome["status"], "placed">;
  readonly resourceType: number;
  readonly resource: string | null;
  readonly plotIndex: number;
  readonly x: number;
  readonly y: number;
  readonly reason: ResourcePlacementReason | null;
  readonly observedResourceType?: number;
  readonly observedResource?: string | null;
  readonly phase?: ResourceAssignmentPhase;
  readonly order?: number;
  readonly initial?: number;
  readonly preferred?: number | null;
  readonly countBefore?: number;
  readonly legalPlots?: number;
  readonly targetMin?: number;
};
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
type ResourcePlacementCoordinateDigest = ResourcePlacementSummary["coordinateProof"]["placed"];

type PlaceResourcesWithTypedOutcomesArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  resources: DeepReadonly<PlanResourcesOutput>;
};
type ResourceAssignmentPhase = "scarce-floor" | "strict-spacing" | "relaxed-spacing";
type ResourceAssignment = {
  plotIndex: number;
  resourceType: number;
  initialResourceType: number;
  preferredResourceType: number | null;
  assignmentPhase: ResourceAssignmentPhase;
  assignmentOrder: number;
  perTypeCountBefore: number;
  legalPlotCountForResource: number;
  targetMinPerType: number;
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
const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

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

function hash32Hex(input: string): string {
  let hash = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function buildResourcePlacementCoordinateDigest(
  outcomes: readonly ResourcePlacementOutcome[],
  status: ResourcePlacementOutcome["status"]
): ResourcePlacementCoordinateDigest {
  const rows = outcomes
    .filter((outcome) => outcome.status === status)
    .slice()
    .sort((a, b) => {
      if (a.plotIndex !== b.plotIndex) return a.plotIndex - b.plotIndex;
      if (a.resourceType !== b.resourceType) return a.resourceType - b.resourceType;
      return (a.observedResourceType ?? -1) - (b.observedResourceType ?? -1);
    })
    .map((outcome) =>
      [
        outcome.status,
        outcome.plotIndex,
        outcome.x,
        outcome.y,
        outcome.resourceType,
        outcome.observedResourceType ?? -1,
        outcome.status === "placed" ? "placed" : outcome.reason,
      ].join(":")
    );
  return { count: rows.length, hash32: hash32Hex(rows.join("|")) };
}

function buildCandidatePlotOrder(
  placements: readonly PlacementCandidate[],
  size: number,
  width: number,
  height: number
): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const placement of placements) {
    const plotIndex = Math.trunc(placement.plotIndex);
    if (plotIndex < 0 || plotIndex >= size || seen.has(plotIndex)) continue;
    seen.add(plotIndex);
    order.push(plotIndex);
  }
  const fallbackOrder =
    width > 0 && height > 0 ? buildDispersedGridOrder({ width, height }) : allPlotIndices(size);
  for (const plotIndex of fallbackOrder) {
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

function isFarEnoughFromAssignments(args: {
  plotIndex: number;
  assignments: readonly ResourceAssignment[];
  width: number;
  minSpacingTiles: number;
}): boolean {
  if (args.minSpacingTiles <= 0) return true;
  for (const assignment of args.assignments) {
    if (
      hexDistanceOddQPeriodicX(args.plotIndex, assignment.plotIndex, args.width) <
      args.minSpacingTiles
    ) {
      return false;
    }
  }
  return true;
}

function findLeastUsedLegalPlot(args: {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  plotOrder: readonly number[];
  resourceType: number;
  usedPlots: ReadonlySet<number>;
  assignments: readonly ResourceAssignment[];
  minSpacingTiles: number;
}): { plotIndex: number | null; spacingBlockedCount: number } {
  let spacingBlockedCount = 0;
  for (const candidatePlot of args.plotOrder) {
    if (args.usedPlots.has(candidatePlot)) continue;
    if (
      !isLegalResourceTile(args.adapter, args.width, args.height, candidatePlot, args.resourceType)
    ) {
      continue;
    }
    if (
      !isFarEnoughFromAssignments({
        plotIndex: candidatePlot,
        assignments: args.assignments,
        width: args.width,
        minSpacingTiles: args.minSpacingTiles,
      })
    ) {
      spacingBlockedCount += 1;
      continue;
    }
    return { plotIndex: candidatePlot, spacingBlockedCount };
  }
  return { plotIndex: null, spacingBlockedCount };
}

function findLegalPlotWithRelaxedSpacing(args: {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  plotOrder: readonly number[];
  resourceType: number;
  usedPlots: ReadonlySet<number>;
  assignments: readonly ResourceAssignment[];
  minSpacingTiles: number;
}): { plotIndex: number | null; spacingBlockedCount: number } {
  let spacingBlockedCount = 0;
  const maxSpacing = Math.max(0, Math.trunc(args.minSpacingTiles));
  for (let spacing = maxSpacing; spacing >= 0; spacing--) {
    const result = findLeastUsedLegalPlot({
      ...args,
      minSpacingTiles: spacing,
    });
    spacingBlockedCount += result.spacingBlockedCount;
    if (result.plotIndex !== null) {
      return {
        plotIndex: result.plotIndex,
        spacingBlockedCount,
      };
    }
  }
  return { plotIndex: null, spacingBlockedCount };
}

function countAssignmentsByResource(
  assignments: readonly ResourceAssignment[],
  candidateResourceTypes: readonly number[]
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const resourceType of candidateResourceTypes) counts.set(resourceType, 0);
  for (const assignment of assignments) {
    counts.set(assignment.resourceType, (counts.get(assignment.resourceType) ?? 0) + 1);
  }
  return counts;
}

function rebalanceAssignmentResourceTypes(args: {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  assignments: ResourceAssignment[];
  candidateResourceTypes: readonly number[];
}): void {
  if (args.candidateResourceTypes.length <= 1 || args.assignments.length <= 1) return;
  const targetMin = Math.floor(args.assignments.length / args.candidateResourceTypes.length);
  const maxIterations = args.assignments.length * args.candidateResourceTypes.length;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const counts = countAssignmentsByResource(args.assignments, args.candidateResourceTypes);
    const underfilled = args.candidateResourceTypes
      .filter((resourceType) => (counts.get(resourceType) ?? 0) < targetMin)
      .sort((a, b) => {
        const countDelta = (counts.get(a) ?? 0) - (counts.get(b) ?? 0);
        return countDelta !== 0 ? countDelta : a - b;
      });
    if (underfilled.length === 0) return;

    let changed = false;
    for (const underfilledResourceType of underfilled) {
      const donorTypes = args.candidateResourceTypes
        .filter((resourceType) => resourceType !== underfilledResourceType)
        .filter((resourceType) => (counts.get(resourceType) ?? 0) > targetMin)
        .sort((a, b) => {
          const countDelta = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
          return countDelta !== 0 ? countDelta : a - b;
        });
      if (donorTypes.length === 0) continue;
      const donorSet = new Set(donorTypes);
      const donor = args.assignments.find(
        (assignment) =>
          donorSet.has(assignment.resourceType) &&
          isLegalResourceTile(
            args.adapter,
            args.width,
            args.height,
            assignment.plotIndex,
            underfilledResourceType
          )
      );
      if (!donor) continue;
      donor.resourceType = underfilledResourceType;
      changed = true;
      break;
    }
    if (!changed) return;
  }
}

function describeResourceType(resourceType: number, authoringAge: OfficialAgeType): string {
  const policy = getInitialMapResourcePolicyForStaticSlot(resourceType, authoringAge);
  return policy
    ? `${resourceType}:${policy.resourceType}:${policy.status}`
    : `${resourceType}:unknown`;
}

function assertInitialMapEligibleResourceTypes(args: {
  candidateResourceTypes: readonly number[];
  placements: readonly { preferredResourceType: number }[];
  authoringAge: OfficialAgeType;
}): void {
  const invalidCandidates = args.candidateResourceTypes.filter(
    (resourceType) =>
      getInitialMapResourcePolicyForStaticSlot(resourceType, args.authoringAge)?.status !==
      "eligible"
  );
  const invalidPreferred = args.placements
    .map((placement) => Math.trunc(placement.preferredResourceType))
    .filter(
      (resourceType) =>
        getInitialMapResourcePolicyForStaticSlot(resourceType, args.authoringAge)?.status !==
        "eligible"
    );
  const invalid = Array.from(new Set([...invalidCandidates, ...invalidPreferred])).sort(
    (a, b) => a - b
  );

  if (invalid.length > 0) {
    throw new Error(
      `[Placement] Resource plan includes non-initial-map resource ids: ${invalid
        .map((resourceType) => describeResourceType(resourceType, args.authoringAge))
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
  const minSpacingTiles = Math.max(0, Math.trunc(args.resources.minSpacingTiles ?? 0));
  const targetMinPerType =
    args.candidateResourceTypes.length > 0
      ? Math.floor(targetCount / args.candidateResourceTypes.length)
      : 0;
  const plannedPlacements = args.resources.placements.map((placement) => ({
    plotIndex: Math.trunc(placement.plotIndex),
    preferredResourceType: Math.trunc(placement.preferredResourceType),
    preferredTypeOffset: Math.trunc(placement.preferredTypeOffset),
    priority: placement.priority,
  }));
  const plotOrder = buildCandidatePlotOrder(plannedPlacements, size, args.width, args.height);
  const preferredByPlot = buildPreferredResourceByPlot(plannedPlacements, size);
  const usedPlots = new Set<number>();
  const perTypeCounts = new Map<number, number>();
  const assignments: ResourceAssignment[] = [];
  let spacingBlockedCount = 0;
  const legalPlotCounts = new Map<number, number>();
  for (const resourceType of args.candidateResourceTypes) {
    let count = 0;
    for (const plotIndex of plotOrder) {
      if (isLegalResourceTile(args.adapter, args.width, args.height, plotIndex, resourceType)) {
        count += 1;
      }
    }
    legalPlotCounts.set(resourceType, count);
  }

  const addAssignment = (
    plotIndex: number,
    resourceType: number,
    assignmentPhase: ResourceAssignmentPhase
  ): void => {
    const countBefore = perTypeCounts.get(resourceType) ?? 0;
    usedPlots.add(plotIndex);
    perTypeCounts.set(resourceType, countBefore + 1);
    assignments.push({
      plotIndex,
      resourceType,
      initialResourceType: resourceType,
      preferredResourceType: preferredByPlot.get(plotIndex) ?? null,
      assignmentPhase,
      assignmentOrder: assignments.length,
      perTypeCountBefore: countBefore,
      legalPlotCountForResource: legalPlotCounts.get(resourceType) ?? 0,
      targetMinPerType,
    });
  };

  const sortedAssignableResourceTypes = (excluded: ReadonlySet<number>): number[] =>
    args.candidateResourceTypes
      .filter((resourceType) => !excluded.has(resourceType))
      .sort((a, b) => {
        const countDelta = (perTypeCounts.get(a) ?? 0) - (perTypeCounts.get(b) ?? 0);
        if (countDelta !== 0) return countDelta;
        const legalDelta = (legalPlotCounts.get(a) ?? 0) - (legalPlotCounts.get(b) ?? 0);
      return legalDelta !== 0 ? legalDelta : a - b;
    });

  if (targetMinPerType > 0) {
    const scarceResourceTypes = [...args.candidateResourceTypes].sort((a, b) => {
      const legalDelta = (legalPlotCounts.get(a) ?? 0) - (legalPlotCounts.get(b) ?? 0);
      return legalDelta !== 0 ? legalDelta : a - b;
    });
    for (const resourceType of scarceResourceTypes) {
      const floorForType = Math.min(targetMinPerType, legalPlotCounts.get(resourceType) ?? 0);
      while ((perTypeCounts.get(resourceType) ?? 0) < floorForType) {
        if (assignments.length >= targetCount) break;
        const result = findLeastUsedLegalPlot({
          adapter: args.adapter,
          width: args.width,
          height: args.height,
          plotOrder,
          resourceType,
          usedPlots,
          assignments,
          minSpacingTiles,
        });
        spacingBlockedCount += result.spacingBlockedCount;
        if (result.plotIndex === null) break;
        addAssignment(result.plotIndex, resourceType, "scarce-floor");
      }
    }
  }

  const strictExhaustedResourceTypes = new Set<number>();
  while (assignments.length < targetCount) {
    const assignableResourceTypes = sortedAssignableResourceTypes(strictExhaustedResourceTypes);
    if (assignableResourceTypes.length === 0) break;

    let progressed = false;
    for (const resourceType of assignableResourceTypes) {
      if (assignments.length >= targetCount) break;
      const result = findLeastUsedLegalPlot({
        adapter: args.adapter,
        width: args.width,
        height: args.height,
        plotOrder,
        resourceType,
        usedPlots,
        assignments,
        minSpacingTiles,
      });
      spacingBlockedCount += result.spacingBlockedCount;
      const plotIndex = result.plotIndex;
      if (plotIndex === null) {
        strictExhaustedResourceTypes.add(resourceType);
        continue;
      }
      addAssignment(plotIndex, resourceType, "strict-spacing");
      progressed = true;
    }
    if (!progressed) break;
  }

  const relaxedExhaustedResourceTypes = new Set<number>();
  while (assignments.length < targetCount) {
    const assignableResourceTypes = args.candidateResourceTypes
      .filter((resourceType) => !relaxedExhaustedResourceTypes.has(resourceType))
      .sort((a, b) => {
        const countDelta = (perTypeCounts.get(a) ?? 0) - (perTypeCounts.get(b) ?? 0);
        if (countDelta !== 0) return countDelta;
        const legalDelta = (legalPlotCounts.get(a) ?? 0) - (legalPlotCounts.get(b) ?? 0);
        return legalDelta !== 0 ? legalDelta : a - b;
      });
    if (assignableResourceTypes.length === 0) break;

    let progressed = false;
    for (const resourceType of assignableResourceTypes) {
      if (assignments.length >= targetCount) break;
      const result = findLegalPlotWithRelaxedSpacing({
        adapter: args.adapter,
        width: args.width,
        height: args.height,
        plotOrder,
        resourceType,
        usedPlots,
        assignments,
        minSpacingTiles,
      });
      spacingBlockedCount += result.spacingBlockedCount;
      const plotIndex = result.plotIndex;
      if (plotIndex === null) {
        relaxedExhaustedResourceTypes.add(resourceType);
        continue;
      }
      addAssignment(plotIndex, resourceType, "relaxed-spacing");
      progressed = true;
    }
    if (!progressed) break;
  }

  rebalanceAssignmentResourceTypes({
    adapter: args.adapter,
    width: args.width,
    height: args.height,
    assignments,
    candidateResourceTypes: args.candidateResourceTypes,
  });

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
      legalPlotCounts,
      minSpacingTiles,
      spacingBlockedCount,
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
  legalPlotCounts: ReadonlyMap<number, number>;
  minSpacingTiles: number;
  spacingBlockedCount: number;
}): ResourceAssignmentSummary {
  const byResource = new Map<
    number,
    {
      legalPlotCount: number;
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
        legalPlotCount: args.legalPlotCounts.get(resourceType) ?? 0,
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
    minSpacingTiles: args.minSpacingTiles,
    spacingBlockedCount: args.spacingBlockedCount,
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
    coordinateProof: {
      version: 1,
      placed: buildResourcePlacementCoordinateDigest(outcomes, "placed"),
      rejected: buildResourcePlacementCoordinateDigest(outcomes, "rejected"),
      mismatch: buildResourcePlacementCoordinateDigest(outcomes, "mismatch"),
    },
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
  runtimeCatalog: readonly RuntimeResourceCatalogEntry[] = readRuntimeResourceCatalog(),
  outcomes: readonly ResourcePlacementRuntimeTelemetryOutcome[] = [],
  assignmentTrace: readonly ResourceAssignment[] = []
): Record<string, unknown> {
  const runtimeByIndex = new Map(runtimeCatalog.map((row) => [row.index, row]));
  const plannedResourceTypes = summary.byResource.filter((row) => row.plannedCount > 0);
  const placedResourceTypes = summary.byResource.filter((row) => row.placedCount > 0);
  const rejectedResourceTypes = summary.byResource.filter((row) => row.rejectedCount > 0);
  const plannedResourceTypeValues = plannedResourceTypes.map((row) => row.resourceType);
  const placedResourceTypeValues = placedResourceTypes.map((row) => row.resourceType);
  const rejectedResourceTypeValues = rejectedResourceTypes.map((row) => row.resourceType);
  const placedCounts = placedResourceTypes.map((row) => row.placedCount);
  const unmappedResourceTypes = summary.byResource.filter(
    (row) => row.placedCount > 0 && !runtimeByIndex.has(row.resourceType)
  );
  const plannedTypeSet = new Set(plannedResourceTypeValues);
  const coveredTypeSet = new Set([...placedResourceTypeValues, ...rejectedResourceTypeValues]);
  const plannedTypesCovered =
    plannedTypeSet.size === coveredTypeSet.size &&
    plannedResourceTypeValues.every((resourceType) => coveredTypeSet.has(resourceType));
  const rejectionRows = resourcePlacementRejectionRows(outcomes, runtimeByIndex, assignmentTrace);
  const rejectionExamples = rejectionRows.map(formatResourcePlacementRejectionExample);
  const hasNonPlacedExamples = rejectionRows.length > 0;

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
    coordinateProof: {
      version: summary.coordinateProof.version,
      placedCount: summary.coordinateProof.placed.count,
      placedHash32: summary.coordinateProof.placed.hash32,
      ...(summary.coordinateProof.rejected.count > 0
        ? {
            rejectedCount: summary.coordinateProof.rejected.count,
            rejectedHash32: summary.coordinateProof.rejected.hash32,
          }
        : {}),
      ...(summary.coordinateProof.mismatch.count > 0
        ? {
            mismatchCount: summary.coordinateProof.mismatch.count,
            mismatchHash32: summary.coordinateProof.mismatch.hash32,
          }
        : {}),
    },
    ...(plannedTypesCovered ? {} : { plannedResourceTypes: plannedResourceTypeValues }),
    ...(hasNonPlacedExamples ? {} : { placedResourceTypes: placedResourceTypeValues }),
    rejectedResourceTypes: rejectedResourceTypeValues,
    ...(rejectionExamples.length === 0
      ? {}
      : {
          rejectionExampleCount: rejectionExamples.length,
          rejectionExamples,
          rejectionRows,
        }),
    ...(unmappedResourceTypes.length === 0
      ? {}
      : { unmappedPlacedResourceTypes: unmappedResourceTypes.map((row) => row.resourceType) }),
    ...(assignment && !hasNonPlacedExamples
      ? {
          assignment: {
            requestedPlannedCount: assignment.requestedPlannedCount,
            assignedCount: assignment.assignedCount,
            minSpacingTiles: assignment.minSpacingTiles,
            spacingBlockedCount: assignment.spacingBlockedCount,
            reassignedCount: assignment.reassignedCount,
            unassignedPreferredCount: assignment.unassignedPreferredCount,
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
  assignment: ResourceAssignmentSummary,
  outcomes: readonly ResourcePlacementRuntimeTelemetryOutcome[] = [],
  assignmentTrace: readonly ResourceAssignment[] = []
): void {
  const runtimeCatalog = readRuntimeResourceCatalog();
  if (runtimeCatalog.length === 0) return;
  console.log(
    `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(
      buildResourcePlacementRuntimeTelemetry(
        summary,
        assignment,
        runtimeCatalog,
        outcomes,
        assignmentTrace
      )
    )}`
  );
}

function resourcePlacementRejectionRows(
  outcomes: readonly ResourcePlacementRuntimeTelemetryOutcome[],
  runtimeByIndex: ReadonlyMap<number, RuntimeResourceCatalogEntry>,
  assignmentTrace: readonly ResourceAssignment[]
): ResourcePlacementRuntimeRejectionExample[] {
  const assignmentByOutcome = new Map(
    assignmentTrace.map((assignment) => [
      `${assignment.plotIndex}:${assignment.resourceType}`,
      assignment,
    ])
  );
  return outcomes
    .filter(isResourcePlacementNonPlacedOutcome)
    .slice(0, 8)
    .map((outcome) => {
      const assignment = assignmentByOutcome.get(`${outcome.plotIndex}:${outcome.resourceType}`);
      return {
        status: outcome.status,
        resourceType: outcome.resourceType,
        resource: runtimeByIndex.get(outcome.resourceType)?.resourceType ?? null,
        plotIndex: outcome.plotIndex,
        x: outcome.x,
        y: outcome.y,
        reason: outcome.reason ?? null,
        ...(outcome.observedResourceType === undefined
          ? {}
          : {
              observedResourceType: outcome.observedResourceType,
              observedResource: runtimeByIndex.get(outcome.observedResourceType)?.resourceType ?? null,
            }),
        ...(assignment === undefined
          ? {}
          : {
              phase: assignment.assignmentPhase,
              order: assignment.assignmentOrder,
              initial: assignment.initialResourceType,
              preferred: assignment.preferredResourceType,
              countBefore: assignment.perTypeCountBefore,
              legalPlots: assignment.legalPlotCountForResource,
              targetMin: assignment.targetMinPerType,
            }),
      };
    });
}

function isResourcePlacementNonPlacedOutcome(
  outcome: ResourcePlacementRuntimeTelemetryOutcome
): outcome is ResourcePlacementRuntimeTelemetryOutcome & { status: "rejected" | "mismatch" } {
  return outcome.status !== "placed";
}

function formatResourcePlacementRejectionExample(
  row: ResourcePlacementRuntimeRejectionExample
): string {
  const fields = [
    `status=${row.status}`,
    `resource=${row.resource ?? "unknown"}`,
    `resourceType=${row.resourceType}`,
    `plot=${row.plotIndex}`,
    `x=${row.x}`,
    `y=${row.y}`,
    `reason=${row.reason ?? "unknown"}`,
  ];
  if (row.observedResourceType !== undefined) {
    fields.push(`observed=${row.observedResourceType}`);
  }
  if (row.observedResource !== undefined && row.observedResource !== null) {
    fields.push(`observedResource=${row.observedResource}`);
  }
  return fields.join(" ");
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
    authoringAge: resolveActiveResourceAge(),
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
    assignmentTrace: assignmentResult.assignments.map((assignment) => {
      const tile = expectedTileForIntent(width, assignment.plotIndex);
      return {
        plotIndex: assignment.plotIndex,
        x: tile.x,
        y: tile.y,
        resourceType: assignment.resourceType,
        initialResourceType: assignment.initialResourceType,
        preferredResourceType: assignment.preferredResourceType,
        assignmentPhase: assignment.assignmentPhase,
        reassignedByRebalance: assignment.initialResourceType !== assignment.resourceType,
        assignmentOrder: assignment.assignmentOrder,
        perTypeCountBefore: assignment.perTypeCountBefore,
        legalPlotCountForResource: assignment.legalPlotCountForResource,
        targetMinPerType: assignment.targetMinPerType,
      };
    }),
    outcomes,
  };
}
