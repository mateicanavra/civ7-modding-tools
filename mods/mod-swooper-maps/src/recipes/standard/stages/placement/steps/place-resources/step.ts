import type { ResourcePlacementOutcome } from "@civ7/adapter";
import { requireResourceRuntimeId } from "@civ7/map-policy";
import { type ArtifactReadValueOf, createStep } from "@swooper/mapgen-core/authoring";

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
type ResourcePlanIntent = ArtifactReadValueOf<
  NonNullable<NonNullable<(typeof config)["artifacts"]>["requires"]>[number]
>["intents"][number];

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

function admitResourcePlacementOutcome(
  planned: ResourcePlanIntent,
  expectedResourceType: number,
  outcome: ResourcePlacementOutcome
): ResourceOutcomeRow {
  if (
    outcome.plotIndex !== planned.plotIndex ||
    outcome.x !== planned.x ||
    outcome.y !== planned.y ||
    outcome.resourceType !== expectedResourceType
  ) {
    throw new Error(
      `[Placement] Resource placement outcome drifted from adjusted-plan identity: ` +
        `expected plot ${planned.plotIndex} at ${planned.x},${planned.y} with requested runtime type ${expectedResourceType}; ` +
        `received plot ${outcome.plotIndex} at ${outcome.x},${outcome.y} with requested runtime type ${outcome.resourceType}.`
    );
  }

  if (
    outcome.status === "mismatch" ||
    (outcome.status === "placed" && outcome.observedResourceType !== expectedResourceType)
  ) {
    const observedResourceType = outcome.observedResourceType;
    throw new Error(
      `[Placement] Resource placement produced wrong-type readback at plot ${planned.plotIndex}: ` +
        `expected runtime type ${expectedResourceType}, observed ${observedResourceType}.`
    );
  }

  if (outcome.status === "placed") {
    return Object.freeze({
      status: "placed",
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
      resourceType: outcome.resourceType,
      phase: planned.phase,
    });
  }

  return Object.freeze({
    status: "rejected",
    plotIndex: outcome.plotIndex,
    x: outcome.x,
    y: outcome.y,
    resourceType: outcome.resourceType,
    phase: planned.phase,
    reason: outcome.reason,
    ...(outcome.observedResourceType === undefined
      ? {}
      : { observedResourceType: outcome.observedResourceType }),
  });
}

/**
 * Materializes the adjusted resource plan exactly once per intent, then emits
 * one terminal measurement of Civ7 acceptance without relocation or type
 * re-decision. The adjusted plan remains authority for type-at-plot; normal
 * engine rejections become typed shortfalls while identity drift fails before
 * any warning, metric, visualization, or exact-log evidence can escape.
 */
export const PlaceResourcesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const plan = deps.artifacts.resourcePlanAdjusted.read(context);
    const outcomes: ResourceOutcomeRow[] = [];

    for (const planned of plan.intents) {
      const resourceType = requireResourceRuntimeId(planned.resourceType).resourceTypeId;
      const outcome = deps.engine.placeResourceIntent(context, {
        plotIndex: planned.plotIndex,
        resourceType,
      });
      outcomes.push(admitResourcePlacementOutcome(planned, resourceType, outcome));
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
  metrics: ({ result }) => ({
    [STANDARD_RESOURCE_PLACEMENT_METRIC_KEY]: result,
  }),
  viz: ({ result, dimensions }) => {
    const rows = result.outcomes.map((outcome) => ({
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
