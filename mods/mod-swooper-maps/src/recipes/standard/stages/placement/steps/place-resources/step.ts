import type {
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
} from "@civ7/adapter";
import { type OfficialResourceType, requireResourceRuntimeId } from "@civ7/map-policy";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import type { TraceJsonObject } from "@swooper/mapgen-core";
import {
  type ArtifactReadValueOf,
  type ArtifactValueOf,
  createStep,
  type DeepReadonly,
} from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";

import {
  logResourcePlacementRuntimeTelemetry,
  runPlacementProductStep,
  warnLog,
} from "../../log.js";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
} from "../../viz.js";
import { config } from "./config.js";

type ResourcePlanOutput = ArtifactReadValueOf<typeof resourceSupportArtifacts.resourcePlanAdjusted>;
type ResourcePlacementOutcomes = ArtifactValueOf<
  typeof resourceSiteArtifacts.resourcePlacementOutcomes
>;
type ResourcePlacementReason = ResourcePlacementRejectionReason | ResourcePlacementMismatchReason;
type ResourcePlacementCoordinateDigest =
  ResourcePlacementOutcomes["summary"]["coordinateEvidence"]["placed"];

type PlaceResourcesWithTypedOutcomesArgs = {
  placeResourceIntent: (
    width: number,
    height: number,
    intent: ResourcePlacementIntent
  ) => ResourcePlacementOutcome;
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

function expectedTileForIntent(
  width: number,
  plotIndex: number
): { plotIndex: number; x: number; y: number } {
  const resolvedPlotIndex = Number.isFinite(plotIndex) ? Math.trunc(plotIndex) : -1;
  const y = Math.trunc(resolvedPlotIndex / width);
  const x = resolvedPlotIndex - y * width;
  return { plotIndex: resolvedPlotIndex, x, y };
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
  return { count: rows.length, hash32: fnv1a32StringHex(rows.join("|")) };
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
    coordinateEvidence: {
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
function placeResourcesWithTypedOutcomes({
  placeResourceIntent,
  width,
  height,
  plan,
}: PlaceResourcesWithTypedOutcomesArgs): ResourcePlacementOutcomes {
  const outcomes: ResourcePlacementOutcome[] = [];
  const byPhase = { rotation: 0, rangeFloor: 0, regionMinimum: 0, support: 0 };
  let supportAdjustedPlacedCount = 0;
  const shortfallCounts = new Map<string, number>();

  for (const planned of plan.intents) {
    const resourceTypeId = requireResourceRuntimeId(
      planned.resourceType as OfficialResourceType
    ).resourceTypeId;
    const intent = {
      plotIndex: planned.plotIndex,
      resourceType: resourceTypeId,
    };
    const outcome = placeResourceIntent(width, height, intent);
    assertResourceOutcomeMatchesIntent(outcome, intent, width);
    outcomes.push(outcome);
    if (outcome.status === "placed") {
      const phase = planned.phase;
      switch (phase) {
        case "rotation":
          byPhase.rotation += 1;
          break;
        case "range-floor":
          byPhase.rangeFloor += 1;
          break;
        case "region-minimum":
          byPhase.regionMinimum += 1;
          break;
        case "support":
          byPhase.support += 1;
          break;
        default:
          assertNever(phase);
      }
      if (planned.support) supportAdjustedPlacedCount += 1;
    } else if (outcome.status === "rejected") {
      const key = `${resourceTypeId}:${outcome.reason}`;
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

function assertNever(value: never): never {
  throw new Error(`[Placement] Unknown resource plan phase ${String(value)}.`);
}

const RESOURCE_OUTCOME_CATEGORIES = [
  { value: 1, label: "Placed", color: [34, 197, 94, 235] as [number, number, number, number] },
  {
    value: 2,
    label: "Rejected: Engine Legality",
    color: [239, 68, 68, 235] as [number, number, number, number],
  },
  {
    value: 3,
    label: "Rejected: Out of Bounds",
    color: [249, 115, 22, 235] as [number, number, number, number],
  },
  {
    value: 4,
    label: "Rejected: Invalid Type",
    color: [217, 70, 239, 235] as [number, number, number, number],
  },
  {
    value: 5,
    label: "Rejected: Wrong Type Readback",
    color: [234, 179, 8, 235] as [number, number, number, number],
  },
] as const;

type ResourceOutcomeRow = Readonly<{
  status: "placed" | "rejected" | "mismatch";
  plotIndex: number;
  reason?:
    | "out-of-bounds"
    | "invalid-resource-type"
    | "cannot-have-resource"
    | "wrong-resource-type";
}>;

function resourceOutcomeCategoryValue(outcome: ResourceOutcomeRow): number {
  if (outcome.status === "placed") return 1;
  switch (outcome.reason) {
    case "cannot-have-resource":
      return 2;
    case "out-of-bounds":
      return 3;
    case "invalid-resource-type":
      return 4;
    default:
      return 5;
  }
}

/**
 * Materializes the adjusted resource plan without relocation or type
 * re-decision and publishes typed placed/rejected outcomes. Resource policy
 * authority remains in the upstream plan.
 */
export const PlaceResourcesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const plan = deps.artifacts.resourcePlanAdjusted.read(context);
    const { width, height } = context.setup.dimensions;
    const emit = (payload: TraceJsonObject): void => {
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.resources", emit, () =>
      placeResourcesWithTypedOutcomes({
        placeResourceIntent: (...args) => deps.engine.placeResourceIntent(context, ...args),
        width,
        height,
        plan,
      })
    );
    if (outcomes.reconciliation.rejectedCount > 0) {
      // Typed reconcile (D4): engine-legality rejections are recorded as
      // shortfalls with reasons; the plan's type-at-plot is never re-decided.
      warnLog(
        `[Placement] Resource reconciliation recorded ${outcomes.reconciliation.rejectedCount}/` +
          `${outcomes.reconciliation.plannedCount} typed rejections (no relocation, no type re-decision).`
      );
      context.trace.event(() => ({
        type: "placement.resources.reconciliationShortfall",
        level: "warn",
        rejectedCount: outcomes.reconciliation.rejectedCount,
        plannedCount: outcomes.reconciliation.plannedCount,
        shortfalls: outcomes.reconciliation.shortfalls,
      }));
    }
    logResourcePlacementRuntimeTelemetry(deps.engine.getResourceCatalog(context), outcomes);
    deps.artifacts.resourcePlacementOutcomes.publish(context, outcomes);
    return outcomes.outcomes;
  },
  viz: ({ result: outcomes, dimensions }) => {
    const rows = outcomes.map((outcome) => ({
      plotIndex: outcome.plotIndex,
      value: resourceOutcomeCategoryValue(outcome),
    }));
    const { positions, values } = buildPlacementPointBuffers(rows, dimensions.width);
    return [
      {
        kind: "points",
        dataTypeKey: "placement.resources.outcome",
        spaceId: PLACEMENT_TILE_SPACE_ID,
        positions,
        values: { format: "u16", values },
        meta: definePlacementVizCategoryMeta(
          "placement.resources.outcome",
          RESOURCE_OUTCOME_CATEGORIES,
          {
            label: "Resource Stamping Outcomes",
            description:
              "Typed reconcile outcomes per planned resource intent: placed, or rejected with the recorded reason (no relocation, no type re-decision). Per-type identity lives on the plan-resources intent layer.",
          }
        ),
      },
    ];
  },
});
