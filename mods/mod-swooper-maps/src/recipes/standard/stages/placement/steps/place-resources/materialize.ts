import type {
  ResourceCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
} from "@civ7/adapter";
import resources from "@mapgen/domain/resources";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

type ResourcePlanOutput = Static<(typeof resources.ops.adjustResourceSupport)["output"]>;
type ResourcePlacementOutcomes = Static<
  typeof import("../../artifacts.js").placementArtifacts["resourcePlacementOutcomes"]["schema"]
>;
type ResourcePlacementReason = ResourcePlacementRejectionReason | ResourcePlacementMismatchReason;
type ResourcePlacementSummary = ResourcePlacementOutcomes["summary"];
type ResourceReconciliationSummary = ResourcePlacementOutcomes["reconciliation"];
type ResourcePlacementRuntimeTelemetryOutcome = ResourcePlacementOutcomes["outcomes"][number];
type ResourcePlacementCoordinateDigest = ResourcePlacementSummary["coordinateProof"]["placed"];

type PlaceResourcesWithTypedOutcomesArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  plan: DeepReadonly<ResourcePlanOutput>;
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

/**
 * RESOURCE_PLACEMENT_V1 runtime telemetry. Same envelope as before the S3
 * cutover (version/planned/placed/rejected/mismatch counts, per-type
 * extremes, coordinate proof, rejection examples); the old `assignment`
 * subblock is replaced by a `reconciliation` subblock because type-at-plot is
 * now plan authority — there is no assignment pass to report.
 */
export function buildResourcePlacementRuntimeTelemetry(
  summary: ResourcePlacementSummary,
  reconciliation?: ResourceReconciliationSummary,
  runtimeCatalog: readonly ResourceCatalogEntry[] = [],
  outcomes: readonly ResourcePlacementRuntimeTelemetryOutcome[] = []
): Record<string, unknown> {
  const runtimeByIndex = new Map(runtimeCatalog.map((row) => [row.index, row]));
  const plannedResourceTypes = summary.byResource.filter((row) => row.plannedCount > 0);
  const placedResourceTypes = summary.byResource.filter((row) => row.placedCount > 0);
  const rejectedResourceTypes = summary.byResource.filter((row) => row.rejectedCount > 0);
  const placedCounts = placedResourceTypes.map((row) => row.placedCount);
  const unmappedResourceTypes = summary.byResource.filter(
    (row) => row.placedCount > 0 && !runtimeByIndex.has(row.resourceType)
  );
  const rejectionRows = outcomes
    .filter((outcome) => outcome.status !== "placed")
    .slice(0, 8)
    .map((outcome) => ({
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
            observedResource:
              runtimeByIndex.get(outcome.observedResourceType)?.resourceType ?? null,
          }),
    }));

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
    rejectedResourceTypes: rejectedResourceTypes.map((row) => row.resourceType),
    ...(rejectionRows.length === 0
      ? {}
      : { rejectionExampleCount: rejectionRows.length, rejectionRows }),
    ...(unmappedResourceTypes.length === 0
      ? {}
      : { unmappedPlacedResourceTypes: unmappedResourceTypes.map((row) => row.resourceType) }),
    ...(reconciliation
      ? {
          reconciliation: {
            plannedCount: reconciliation.plannedCount,
            placedCount: reconciliation.placedCount,
            rejectedCount: reconciliation.rejectedCount,
            byPhase: reconciliation.byPhase,
            ...(reconciliation.shortfalls.length > 0
              ? { shortfalls: reconciliation.shortfalls }
              : {}),
          },
        }
      : {}),
    byReason: summary.byReason,
  };
}

export function logResourcePlacementRuntimeTelemetry(
  runtimeCatalog: readonly ResourceCatalogEntry[],
  summary: ResourcePlacementSummary,
  reconciliation: ResourceReconciliationSummary,
  outcomes: readonly ResourcePlacementRuntimeTelemetryOutcome[] = []
): void {
  if (runtimeCatalog.length === 0) return;
  console.log(
    `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(
      buildResourcePlacementRuntimeTelemetry(summary, reconciliation, runtimeCatalog, outcomes)
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
 * Thin materializer (placement-realignment S3 / D4, reordered by S5 / D3):
 * stamps the typed plot intents from the ADJUSTED resource plan (site
 * selection + post-starts support pass) and reconciles engine legality with
 * typed outcomes.
 *
 * The adjusted plan is authority for type-at-plot. Engine rejections are
 * recorded as typed shortfalls per resource type; there is NO type
 * re-decision, NO relocation, and NO whole-map fallback here. Wrong-type
 * readback (mismatch) remains fail-hard. Support-pass provenance is carried
 * into the outcomes (byPhase.support + supportAdjustedPlacedCount).
 */
export function placeResourcesWithTypedOutcomes({
  adapter,
  width,
  height,
  plan,
}: PlaceResourcesWithTypedOutcomesArgs): ResourcePlacementOutcomes {
  if ((plan.width | 0) !== (width | 0) || (plan.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Resource plan dimensions ${plan.width}x${plan.height} do not match map ${width}x${height}.`
    );
  }
  if ((plan.plannedCount | 0) !== plan.intents.length) {
    throw new Error(
      `[Placement] Resource plan metadata mismatch (plannedCount=${plan.plannedCount}, intents=${plan.intents.length}).`
    );
  }

  const outcomes: ResourcePlacementOutcome[] = [];
  const byPhase = { rotation: 0, rangeFloor: 0, regionMinimum: 0, support: 0 };
  let supportAdjustedPlacedCount = 0;
  const shortfallCounts = new Map<string, number>();

  for (const planned of plan.intents) {
    const intent = {
      plotIndex: planned.plotIndex,
      resourceType: planned.resourceTypeId,
    };
    const outcome = adapter.placeResourceIntent(width, height, intent);
    assertResourceOutcomeMatchesIntent(outcome, intent, width);
    outcomes.push(outcome);
    if (outcome.status === "placed") {
      if (planned.phase === "rotation") byPhase.rotation += 1;
      else if (planned.phase === "range-floor") byPhase.rangeFloor += 1;
      else if (planned.phase === "region-minimum") byPhase.regionMinimum += 1;
      else byPhase.support += 1;
      if (planned.support) supportAdjustedPlacedCount += 1;
    } else if (outcome.status === "rejected") {
      const key = `${planned.resourceTypeId}:${outcome.reason}`;
      shortfallCounts.set(key, (shortfallCounts.get(key) ?? 0) + 1);
    }
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

  const placedCount = outcomes.filter((outcome) => outcome.status === "placed").length;
  const shortfalls = Array.from(shortfallCounts.entries())
    .map(([key, count]) => {
      const [resourceType, reason] = key.split(":") as [string, string];
      return {
        resourceType: Number(resourceType),
        reason: reason as "out-of-bounds" | "invalid-resource-type" | "cannot-have-resource",
        count,
      };
    })
    .sort((a, b) => a.resourceType - b.resourceType || a.reason.localeCompare(b.reason));

  return {
    summary: summarizeResourceOutcomes(outcomes),
    reconciliation: {
      plannedCount: plan.intents.length,
      placedCount,
      rejectedCount: plan.intents.length - placedCount,
      shortfalls,
      byPhase,
      supportAdjustedPlacedCount,
    },
    outcomes,
  };
}
