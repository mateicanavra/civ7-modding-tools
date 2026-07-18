import { defineVizMeta, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  buildPlacementPointBuffers,
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
} from "../../viz.js";
import PlaceNaturalWondersStepContract from "./contract.js";
import {
  logNaturalWonderPlacementRuntimeTelemetry,
  type NaturalWonderStampingStats,
  stampNaturalWondersFromPlan,
} from "./materialize.js";

const WONDER_OUTCOME_CATEGORIES = [
  { value: 1, label: "Placed", color: [34, 197, 94, 235] as [number, number, number, number] },
  {
    value: 2,
    label: "Placed (Relocated)",
    color: [14, 165, 233, 235] as [number, number, number, number],
  },
  { value: 3, label: "Rejected", color: [239, 68, 68, 235] as [number, number, number, number] },
];

/**
 * Placed vs rejected natural-wonder anchors from the stamping coordinate rows
 * (E4.3): relocations (engine moved the anchor) get their own category; the
 * per-row rejection reason strings live in the artifact's coordinateRows.
 */
function emitNaturalWonderOutcomeViz(
  context: ExtendedMapContext,
  coordinateRows: NaturalWonderStampingStats["coordinateRows"]
): void {
  if (!context.viz) return;
  const { width } = context.dimensions;
  const rows = coordinateRows.map((row) => ({
    plotIndex: row.plotIndex,
    value:
      row.status === "rejected"
        ? 3
        : typeof row.observedPlotIndex === "number" && row.observedPlotIndex !== row.plotIndex
          ? 2
          : 1,
  }));
  const { positions, values } = buildPlacementPointBuffers(rows, width);
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: "placement.wonders.outcome",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.wonders.outcome", {
      label: "Natural Wonder Outcomes",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "Planned wonder anchors after stamping: placed, placed-with-engine-relocation, or rejected. Per-row reasons and footprint readbacks live in the naturalWonderPlacement artifact.",
      palette: "categorical",
      categories: WONDER_OUTCOME_CATEGORIES,
    }),
  });
}

/**
 * Stamps planned natural wonders and records relocations, rejections, and
 * shortfalls as reconciliation evidence rather than aborting optional misses.
 */
export default createStep(PlaceNaturalWondersStepContract, {
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read(context);
    const { width, height } = context.dimensions;

    const stamping: NaturalWonderStampingStats = stampNaturalWondersFromPlan({
      adapter: context.adapter,
      width,
      height,
      wonders: naturalWonderPlan,
      requestedCount: placementInputs.wonders.wondersCount,
    });

    emitNaturalWonderOutcomeViz(context, stamping.coordinateRows);
    deps.artifacts.naturalWonderPlacement.publish(context, stamping);
    logNaturalWonderPlacementRuntimeTelemetry(stamping);
  },
});
