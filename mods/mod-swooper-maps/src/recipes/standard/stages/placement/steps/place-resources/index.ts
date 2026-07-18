import { defineVizMeta, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { warnLog } from "../../log.js";
import {
  buildPlacementPointBuffers,
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
} from "../../viz.js";
import { runPlacementProductStep } from "../product-runtime.js";
import PlaceResourcesStepContract from "./contract.js";
import {
  logResourcePlacementRuntimeTelemetry,
  placeResourcesWithTypedOutcomes,
} from "./materialize.js";

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
];

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

/** Placed vs rejected-with-reason points from the typed reconcile (D4 / E4.3). */
function emitResourceOutcomeViz(
  context: ExtendedMapContext,
  outcomes: ReadonlyArray<ResourceOutcomeRow>
): void {
  if (!context.viz) return;
  const { width } = context.dimensions;
  const rows = outcomes.map((outcome) => ({
    plotIndex: outcome.plotIndex,
    value: resourceOutcomeCategoryValue(outcome),
  }));
  const { positions, values } = buildPlacementPointBuffers(rows, width);
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: "placement.resources.outcome",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.resources.outcome", {
      label: "Resource Stamping Outcomes",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "Typed reconcile outcomes per planned resource intent: placed, or rejected with the recorded reason (no relocation, no type re-decision). Per-type identity lives on the plan-resources intent layer.",
      palette: "categorical",
      categories: RESOURCE_OUTCOME_CATEGORIES,
    }),
  });
}

/**
 * Materializes the adjusted resource plan without relocation or type
 * re-decision and publishes typed placed/rejected outcomes. Resource policy
 * authority remains in the upstream plan.
 */
export default createStep(PlaceResourcesStepContract, {
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
      warnLog(
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
    emitResourceOutcomeViz(context, outcomes.outcomes);
    deps.artifacts.resourcePlacementOutcomes.publish(context, outcomes);
  },
});
