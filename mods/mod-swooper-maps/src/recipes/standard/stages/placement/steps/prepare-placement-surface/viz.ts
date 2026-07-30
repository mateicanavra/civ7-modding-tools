import type { VizProjection } from "@swooper/mapgen-viz";
import {
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
  transparentNoneCategory,
} from "../../viz.js";

type TerrainValidationBoundaryReadback = Readonly<{
  stage: string;
  terrain: Int32Array;
  waterMask: Uint8Array;
  lakeMask: Uint8Array;
  areaId: Int32Array;
}>;

/**
 * Projects exact engine-maintenance boundary readbacks and their local terrain
 * drift. Terminal product parity is observed only after every placement
 * product has completed.
 */
export function projectPlacementSurfaceViz(input: {
  beforeValidate: TerrainValidationBoundaryReadback;
  afterValidate: TerrainValidationBoundaryReadback;
  afterMaintenance: TerrainValidationBoundaryReadback;
  dimensions: Readonly<{ width: number; height: number }>;
}): readonly VizProjection[] {
  const { width, height } = input.dimensions;
  const size = width * height;

  const terrainDrift = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const terrainChanged = input.beforeValidate.terrain[i] !== input.afterMaintenance.terrain[i];
    const waterChanged = input.beforeValidate.waterMask[i] !== input.afterMaintenance.waterMask[i];
    terrainDrift[i] =
      terrainChanged && waterChanged ? 3 : waterChanged ? 2 : terrainChanged ? 1 : 0;
  }

  return [
    ...projectMaintenanceBoundaries(input),
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
            "Tiles changed by the engine's placement-surface maintenance transaction between its before-validation and after-maintenance readbacks.",
        }
      ),
    },
  ];
}

function projectMaintenanceBoundaries(input: {
  beforeValidate: TerrainValidationBoundaryReadback;
  afterValidate: TerrainValidationBoundaryReadback;
  afterMaintenance: TerrainValidationBoundaryReadback;
  dimensions: Readonly<{ width: number; height: number }>;
}): readonly VizProjection[] {
  return [
    projectMaintenanceBoundary(input.beforeValidate, "before-validate", input.dimensions),
    projectMaintenanceBoundary(input.afterValidate, "after-validate", input.dimensions),
    projectMaintenanceBoundary(input.afterMaintenance, "after-maintenance", input.dimensions),
  ];
}

function projectMaintenanceBoundary(
  boundary: TerrainValidationBoundaryReadback,
  variantKey: "before-validate" | "after-validate" | "after-maintenance",
  dimensions: Readonly<{ width: number; height: number }>
): VizProjection {
  return {
    kind: "gridFields",
    dataTypeKey: "map.placement.surface.maintenanceBoundary",
    variantKey,
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: dimensions,
    fields: {
      terrain: { format: "i32", values: boundary.terrain },
      waterMask: { format: "u8", values: boundary.waterMask },
      lakeMask: { format: "u8", values: boundary.lakeMask },
      areaId: { format: "i32", values: boundary.areaId },
    },
    meta: {
      label: `Placement Surface: ${maintenanceBoundaryLabel(variantKey)}`,
      group: PLACEMENT_VIZ_GROUP,
      visibility: "debug",
      description:
        "Exact Civ7 terrain, water, lake, and area readback at one placement maintenance boundary.",
    },
  };
}

function maintenanceBoundaryLabel(
  variantKey: "before-validate" | "after-validate" | "after-maintenance"
): string {
  if (variantKey === "before-validate") return "Before Validation";
  if (variantKey === "after-validate") return "After Validation";
  return "After Maintenance";
}
