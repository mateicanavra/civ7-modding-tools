import type {
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
} from "@civ7/adapter";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";

type PlanDiscoveriesOutput = Static<(typeof placement.ops.planDiscoveries)["output"]>;
type DiscoveryPlacementOutcomes = Static<
  (typeof import("../../artifacts.js").placementArtifacts)["discoveryPlacementOutcomes"]["schema"]
>;

type PlaceDiscoveriesWithTypedOutcomesArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  discoveries: DeepReadonly<PlanDiscoveriesOutput>;
};

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
 * typed per-tile outcomes.
 *
 * Discoveries are adapter-visible engine products. This step-local owner keeps
 * adapter outcome policy beside the effect that uses it, while final placement
 * only consumes the typed artifact for summary evidence.
 */
export function placeDiscoveriesWithTypedOutcomes({
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
  for (const placementPlan of discoveries.placements) {
    const intent = {
      plotIndex: placementPlan.plotIndex,
      discoveryVisualType: placementPlan.preferredDiscoveryVisualType,
      discoveryActivationType: placementPlan.preferredDiscoveryActivationType,
    };
    const outcome = adapter.placeDiscoveryIntent(width, height, intent);
    assertDiscoveryOutcomeMatchesIntent(outcome, intent, width);
    outcomes.push(outcome);
  }

  return { summary: summarizeDiscoveryOutcomes(outcomes), outcomes };
}
