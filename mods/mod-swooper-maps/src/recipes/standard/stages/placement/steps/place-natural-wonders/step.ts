import { NO_FEATURE_TYPE } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
} from "../../viz.js";
import { PlaceNaturalWondersStepContract } from "./config.js";
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
] as const;

/**
 * Stamps planned natural wonders and records relocations, rejections, and
 * shortfalls as reconciliation evidence rather than aborting optional misses.
 */
export const PlaceNaturalWondersStep = createStep(PlaceNaturalWondersStepContract, {
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read(context);
    const { width, height } = context.setup.dimensions;
    const engine = {
      getFeatureType: (x: number, y: number) => deps.engine.getFeatureType(context, x, y),
      getTerrainType: (x: number, y: number) => deps.engine.getTerrainType(context, x, y),
      setTerrainType: (x: number, y: number, terrainType: number) =>
        deps.engine.setTerrainType(context, x, y, terrainType),
      placeNaturalWonder: (
        x: number,
        y: number,
        featureType: number,
        direction: number,
        elevation?: number
      ) => deps.engine.placeNaturalWonder(context, x, y, featureType, direction, elevation),
    };

    const stamping: NaturalWonderStampingStats = stampNaturalWondersFromPlan({
      engine,
      noFeatureType: NO_FEATURE_TYPE,
      width,
      height,
      wonders: naturalWonderPlan,
      requestedCount: placementInputs.wonders.wondersCount,
    });

    deps.artifacts.naturalWonderPlacement.publish(context, stamping);
    logNaturalWonderPlacementRuntimeTelemetry(stamping);
    return stamping.coordinateRows;
  },
  viz: ({ result: coordinateRows, dimensions }) => {
    const rows = coordinateRows.map((row) => ({
      plotIndex: row.plotIndex,
      value:
        row.status === "rejected"
          ? 3
          : typeof row.observedPlotIndex === "number" && row.observedPlotIndex !== row.plotIndex
            ? 2
            : 1,
    }));
    const { positions, values } = buildPlacementPointBuffers(rows, dimensions.width);
    return [
      {
        kind: "points",
        dataTypeKey: "placement.wonders.outcome",
        spaceId: PLACEMENT_TILE_SPACE_ID,
        positions,
        values: { format: "u16", values },
        meta: definePlacementVizCategoryMeta(
          "placement.wonders.outcome",
          WONDER_OUTCOME_CATEGORIES,
          {
            label: "Natural Wonder Outcomes",
            description:
              "Planned wonder anchors after stamping: placed, placed-with-engine-relocation, or rejected. Per-row reasons and footprint readbacks live in the naturalWonderPlacement artifact.",
          }
        ),
      },
    ];
  },
});
