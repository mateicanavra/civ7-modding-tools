import type { VizProjection } from "@swooper/mapgen-viz";
import { STANDARD_VIZ_COLORS } from "../../../../viz.js";
import {
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
  transparentNoneCategory,
} from "../../viz.js";
import type { ApplyPlacementResult } from "./apply.js";

/**
 * Projects the final engine surface and its physics-comparison drift after placement completes.
 * The engine snapshot is borrowed exactly as captured; only the drift array was derived by behavior.
 */
export function projectPlacementCompletionViz(
  result: ApplyPlacementResult,
  dimensions: Readonly<{ width: number; height: number }>
): readonly VizProjection[] {
  if (!result.engineSnapshot) return [];
  const projections: VizProjection[] = [];
  if (result.waterDrift.length === dimensions.width * dimensions.height) {
    projections.push({
      kind: "grid",
      dataTypeKey: "map.placement.engine.waterDrift",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.waterDrift },
      meta: definePlacementVizCategoryMeta(
        "map.placement.engine.waterDrift",
        [
          transparentNoneCategory("In Agreement"),
          { value: 1, label: "Engine Land / Physics Water", color: [34, 197, 94, 235] },
          { value: 2, label: "Engine Water / Physics Land", color: [239, 68, 68, 235] },
        ],
        {
          label: "Engine vs Physics Water Drift",
          visibility: "debug",
          description:
            "Tiles where the post-placement engine land mask disagrees with the Morphology physics land mask (the waterDriftCount parity evidence).",
        }
      ),
    });
  }
  projections.push({
    kind: "grid",
    dataTypeKey: "map.placement.engine.landMask",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: dimensions,
    field: { format: "u8", values: result.engineSnapshot.landMask },
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
