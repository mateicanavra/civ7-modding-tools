import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { runPlacementProductStep } from "../product-runtime.js";
import {
  logResourcePlacementRuntimeTelemetry,
  placeResourcesWithTypedOutcomes,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import PlaceResourcesStepContract from "./contract.js";

function validateResourcePlacementOutcomesArtifact(value: unknown): { message: string }[] {
  if (typeof value !== "object" || value === null) {
    return [{ message: "resourcePlacementOutcomes artifact must be an object." }];
  }
  const issues: { message: string }[] = [];
  const artifact = value as {
    summary?: { plannedCount?: number; placedCount?: number; mismatchCount?: number };
    reconciliation?: { plannedCount?: number; placedCount?: number; rejectedCount?: number };
    outcomes?: unknown[];
  };
  const outcomes = Array.isArray(artifact.outcomes) ? artifact.outcomes : [];
  if (artifact.summary?.plannedCount !== outcomes.length) {
    issues.push({
      message: `summary.plannedCount ${String(artifact.summary?.plannedCount)} != outcomes.length ${outcomes.length}.`,
    });
  }
  if ((artifact.summary?.mismatchCount ?? 0) !== 0) {
    issues.push({
      message: "mismatch outcomes are fail-hard and must never be published in the artifact.",
    });
  }
  const reconciliation = artifact.reconciliation;
  if (
    reconciliation &&
    (reconciliation.placedCount ?? 0) + (reconciliation.rejectedCount ?? 0) !==
      (reconciliation.plannedCount ?? 0)
  ) {
    issues.push({ message: "reconciliation placed+rejected must equal planned." });
  }
  if (reconciliation && artifact.summary?.placedCount !== reconciliation.placedCount) {
    issues.push({ message: "summary.placedCount != reconciliation.placedCount." });
  }
  return issues;
}

export default createStep(PlaceResourcesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.resourcePlacementOutcomes], {
    resourcePlacementOutcomes: {
      validate: (value) => validateResourcePlacementOutcomesArtifact(value),
    },
  }),
  run: (context, _config, _ops, deps) => {
    const plan = deps.artifacts.resourcePlanAdjusted.read(context);
    const { width, height } = context.dimensions;
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.resources", emit, () =>
      placeResourcesWithTypedOutcomes({ adapter: context.adapter, width, height, plan })
    );
    if (outcomes.reconciliation.rejectedCount > 0) {
      // Typed reconcile (D4): engine-legality rejections are recorded as
      // shortfalls with reasons; the plan's type-at-plot is never re-decided.
      console.warn(
        `[Placement] Resource reconciliation recorded ${outcomes.reconciliation.rejectedCount}/` +
          `${outcomes.reconciliation.plannedCount} typed rejections (no relocation, no type re-decision).`
      );
      context.trace?.event(() => ({
        type: "placement.resources.reconciliationShortfall",
        level: "warn",
        rejectedCount: outcomes.reconciliation.rejectedCount,
        plannedCount: outcomes.reconciliation.plannedCount,
        shortfalls: outcomes.reconciliation.shortfalls,
      }));
    }
    logResourcePlacementRuntimeTelemetry(
      context.adapter.getResourceCatalog(),
      outcomes.summary,
      outcomes.reconciliation,
      outcomes.outcomes
    );
    deps.artifacts.resourcePlacementOutcomes.publish(context, outcomes);
  },
});
