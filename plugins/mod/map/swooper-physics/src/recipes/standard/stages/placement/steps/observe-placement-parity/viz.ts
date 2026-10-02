import type { VizProjection } from "@swooper/mapgen-viz";
import { defineStandardVizMeta, STANDARD_VIZ_COLORS } from "../../../../viz.js";
import {
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
  transparentNoneCategory,
} from "../../viz.js";

type PlacementParityVizObservation = Readonly<{
  engineObservation: Readonly<{
    terrain: Int32Array;
    elevation?: Float64Array;
    landMask: Uint8Array;
  }>;
  waterDrift: Uint8Array;
}>;

/**
 * Projects the final engine surface and its physics-comparison drift after placement completes.
 * The adapter observation is reused exactly as read; only the drift array is derived.
 */
export function projectPlacementParityViz(
  observation: PlacementParityVizObservation,
  dimensions: Readonly<{ width: number; height: number }>
): readonly VizProjection[] {
  const projections: VizProjection[] = [];
  if (observation.engineObservation.elevation !== undefined) {
    projections.push({
      kind: "grid",
      dataTypeKey: "map.placement.engine.elevation",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: Float32Array.from(observation.engineObservation.elevation) },
      meta: defineStandardVizMeta("map.placement.engine.elevation", "terrain.elevation", {
        label: "Elevation (Engine After Placement)",
        group: "Map / Elevation (Engine)",
        role: "engine",
        description:
          "Float32 display of the exact terminal numeric observation; metrics retain full precision.",
      }),
    });
  }
  if (observation.waterDrift.length === dimensions.width * dimensions.height) {
    projections.push({
      kind: "grid",
      dataTypeKey: "map.placement.engine.waterDrift",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.waterDrift },
      meta: definePlacementVizCategoryMeta(
        "map.placement.engine.waterDrift",
        [
          transparentNoneCategory("In Agreement"),
          { value: 1, label: "Engine Land / Projected Water", color: [34, 197, 94, 235] },
          { value: 2, label: "Engine Water / Projected Land", color: [239, 68, 68, 235] },
        ],
        {
          label: "Engine vs Projected Water Drift",
          visibility: "debug",
          description:
            "Tiles where the post-placement engine land mask disagrees with the projected land and accepted-lake surface.",
        }
      ),
    });
  }
  projections.push({
    kind: "grid",
    dataTypeKey: "map.placement.engine.landMask",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: dimensions,
    field: { format: "u8", values: observation.engineObservation.landMask },
    meta: definePlacementVizCategoryMeta(
      "map.placement.engine.landMask",
      [
        { value: 0, label: "Water", color: STANDARD_VIZ_COLORS.water.ocean },
        { value: 1, label: "Land", color: STANDARD_VIZ_COLORS.land },
      ],
      {
        label: "Land Mask (Engine After Placement)",
        role: "engine",
      }
    ),
  });
  return projections;
}
