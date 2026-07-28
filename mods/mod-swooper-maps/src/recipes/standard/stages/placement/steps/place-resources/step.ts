import type { ResourcePlacementOutcome } from "@civ7/adapter";
import { requireResourceRuntimeId } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";

import {
  measureStandardResourcePlacement,
  STANDARD_RESOURCE_PLACEMENT_METRIC_KEY,
  type StandardResourcePlacementMeasurements,
} from "../../../../metrics/families/placement/resource-placement.js";
import { emitStandardResourcePlacementExactLog } from "../../../../parity/placement-exact-log.js";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
} from "../../viz.js";
import { config } from "./config.js";

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
] as const;

type ResourceOutcomeRow = StandardResourcePlacementMeasurements["outcomes"][number];
type ResourcePlacementPhase = ResourceOutcomeRow["phase"];

function resourceOutcomeCategoryValue(outcome: ResourceOutcomeRow): number {
  if (outcome.status === "placed") return 1;
  switch (outcome.reason) {
    case "cannot-have-resource":
      return 2;
    case "out-of-bounds":
      return 3;
    case "invalid-resource-type":
      return 4;
  }
}

/**
 * Projects an adapter-owned terminal outcome into recipe evidence, adding only
 * the planning phase that explains which product demand produced the request.
 */
function projectResourcePlacementOutcome(
  phase: ResourcePlacementPhase,
  outcome: ResourcePlacementOutcome
): ResourceOutcomeRow {
  switch (outcome.status) {
    case "placed":
      return {
        status: "placed",
        plotIndex: outcome.plotIndex,
        x: outcome.x,
        y: outcome.y,
        resourceType: outcome.resourceType,
        phase,
      };
    case "rejected":
      return {
        status: "rejected",
        plotIndex: outcome.plotIndex,
        x: outcome.x,
        y: outcome.y,
        resourceType: outcome.resourceType,
        phase,
        reason: outcome.reason,
        ...(outcome.observedResourceType === undefined
          ? {}
          : { observedResourceType: outcome.observedResourceType }),
      };
    case "mismatch":
      throw new Error(
        `[Placement] Resource placement readback mismatch at plot ${outcome.plotIndex}: ` +
          `requested runtime type ${outcome.resourceType}, observed ${outcome.observedResourceType}.`
      );
  }
}

/**
 * Materializes each adjusted resource intent once, then closes Civ7's typed
 * outcomes into terminal product evidence. The adapter owns bounds,
 * coordinates, feasibility, and readback identity; this recipe preserves the
 * originating plan phase, warns on normal rejections, and fails only when the
 * adapter explicitly reports a readback mismatch.
 */
export const PlaceResourcesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const plan = deps.artifacts.resourcePlanAdjusted.read();
    const outcomes: ResourceOutcomeRow[] = [];

    for (const planned of plan.intents) {
      const resourceType = requireResourceRuntimeId(planned.resourceType).resourceTypeId;
      const outcome = deps.engine.placeResourceIntent(context, {
        plotIndex: planned.plotIndex,
        resourceType,
      });
      outcomes.push(projectResourcePlacementOutcome(planned.phase, outcome));
    }

    const measurements = measureStandardResourcePlacement(outcomes);

    if (measurements.summary.rejectedCount > 0) {
      deps.engine.emitRuntimeWarning(
        context,
        `[Placement] Resource reconciliation recorded ${measurements.summary.rejectedCount}/` +
          `${measurements.summary.plannedCount} typed rejections (no relocation, no type re-decision).`
      );
      context.trace.event(() => ({
        type: "placement.resources.reconciliationShortfall",
        level: "warn",
        rejectedCount: measurements.summary.rejectedCount,
        plannedCount: measurements.summary.plannedCount,
        shortfalls: measurements.summary.shortfalls,
      }));
    }

    emitStandardResourcePlacementExactLog(deps.engine.getResourceCatalog(context), measurements);
    return measurements;
  },
  metrics: ({ observation }) => ({
    [STANDARD_RESOURCE_PLACEMENT_METRIC_KEY]: observation,
  }),
  viz: ({ observation, dimensions }) => {
    const rows = observation.outcomes.map((outcome) => ({
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
              "Typed reconcile outcomes per planned resource intent: placed, or rejected with the recorded reason (no relocation, no type re-decision). Per-type identity lives on the select-resource-sites intent layer.",
          }
        ),
      },
    ];
  },
});
