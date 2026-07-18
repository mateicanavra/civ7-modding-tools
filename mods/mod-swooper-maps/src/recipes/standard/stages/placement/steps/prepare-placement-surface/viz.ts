import type { VizProjection } from "@swooper/mapgen-viz";
import {
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
  transparentNoneCategory,
} from "../../viz.js";
import type { TerrainValidationBoundarySnapshot } from "./terrain-validation-readback.js";

/**
 * Projects per-tile drift behind the surface-maintenance parity counters.
 * It observes completed engine snapshots and never participates in validation or restamping.
 */
export function projectPlacementSurfaceDriftViz(input: {
  acceptedLakeMask: Uint8Array;
  beforeValidate: TerrainValidationBoundarySnapshot;
  afterMaintenance: TerrainValidationBoundarySnapshot;
  dimensions: Readonly<{ width: number; height: number }>;
}): readonly VizProjection[] {
  const { width, height } = input.dimensions;
  const size = Math.max(0, width * height);

  const lakeDrift = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    if (input.acceptedLakeMask[i] !== 1) continue;
    if (input.afterMaintenance.waterMask[i] !== 1) lakeDrift[i] = 2;
    else if (input.afterMaintenance.lakeMask[i] !== 1) lakeDrift[i] = 3;
    else lakeDrift[i] = 1;
  }

  const terrainDrift = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const terrainChanged = input.beforeValidate.terrain[i] !== input.afterMaintenance.terrain[i];
    const waterChanged = input.beforeValidate.waterMask[i] !== input.afterMaintenance.waterMask[i];
    terrainDrift[i] =
      terrainChanged && waterChanged ? 3 : waterChanged ? 2 : terrainChanged ? 1 : 0;
  }

  return [
    {
      kind: "grid",
      dataTypeKey: "map.placement.surface.lakeDrift",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u8", values: lakeDrift },
      meta: definePlacementVizCategoryMeta(
        "map.placement.surface.lakeDrift",
        [
          transparentNoneCategory("Not Accepted Lake"),
          { value: 1, label: "Lake Stable", color: [59, 130, 246, 200] },
          { value: 2, label: "Dried (Water Drift)", color: [239, 68, 68, 235] },
          { value: 3, label: "Declassified", color: [245, 158, 11, 235] },
        ],
        {
          label: "Lake Drift (Surface Maintenance)",
          visibility: "debug",
          description:
            "Accepted lake tiles after final engine surface maintenance: stable, dried (no longer water), or declassified (water but not a Civ7 lake).",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "map.placement.surface.terrainValidationDrift",
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: input.dimensions,
      field: { format: "u8", values: terrainDrift },
      meta: definePlacementVizCategoryMeta(
        "map.placement.surface.terrainValidationDrift",
        [
          transparentNoneCategory("Unchanged"),
          { value: 1, label: "Terrain Changed", color: [245, 158, 11, 235] },
          { value: 2, label: "Water Changed", color: [59, 130, 246, 235] },
          { value: 3, label: "Both Changed", color: [239, 68, 68, 235] },
        ],
        {
          label: "Terrain Validation Drift",
          visibility: "debug",
          description:
            "Tiles the engine's validateAndFixTerrain/maintenance pass changed between the before-validate and after-maintenance snapshots (terrain type and/or water classification).",
        }
      ),
    },
  ];
}
