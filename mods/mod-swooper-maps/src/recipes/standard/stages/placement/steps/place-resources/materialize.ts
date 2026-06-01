import type {
  ResourcePlacementIntent,
  ResourcePlacementOutcome,
} from "@civ7/adapter";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";

type PlanResourcesOutput = Static<(typeof placement.ops.planResources)["output"]>;
type ResourcePlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["resourcePlacementOutcomes"]["schema"]
>;

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
  return { plannedCount: outcomes.length, placedCount, rejectedCount, mismatchCount };
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

  const outcomes: ResourcePlacementOutcome[] = [];
  for (const placementPlan of resources.placements) {
    const intent = {
      plotIndex: placementPlan.plotIndex,
      resourceType: placementPlan.preferredResourceType,
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

  return { summary: summarizeResourceOutcomes(outcomes), outcomes };
}
