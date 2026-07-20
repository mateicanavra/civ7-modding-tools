import type {
  VizDataTypeKey,
  VizLayerCategory,
  VizLayerMeta,
  VizRgbaColor,
  VizValueSpec,
} from "@swooper/mapgen-viz";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_STYLES,
  type StandardVizStyle,
} from "../../viz.js";

type PlacementVizMetaOverrides = Omit<Partial<VizLayerMeta>, "categories" | "group" | "palette">;

/** Stable Studio group shared by every placement-owned step projection. */
export const PLACEMENT_VIZ_GROUP = "Gameplay / Placement";

/** Civ7 placement's canonical odd-column-offset tile coordinate space. */
export const PLACEMENT_TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Resolves a Standard recipe style while attaching placement's stable Studio group.
 * Placement callers own the layer semantics; this helper prevents group and palette drift.
 */
export function definePlacementVizMeta(
  dataTypeKey: VizDataTypeKey,
  style: StandardVizStyle,
  meta: PlacementVizMetaOverrides = {}
): VizLayerMeta {
  return defineStandardVizMeta(dataTypeKey, style, {
    ...meta,
    group: PLACEMENT_VIZ_GROUP,
  });
}

/**
 * Attaches placement's stable Studio group to an explicit, owner-defined category table.
 * Category identity stays local to the placement decision that produced the values.
 */
export function definePlacementVizCategoryMeta(
  dataTypeKey: VizDataTypeKey,
  categories: readonly [VizLayerCategory, ...VizLayerCategory[]],
  meta: PlacementVizMetaOverrides = {}
): VizLayerMeta {
  return defineStandardVizCategoryMeta(dataTypeKey, categories, {
    ...meta,
    group: PLACEMENT_VIZ_GROUP,
  });
}

/**
 * Stable legend domain for 0..1 scores (audit-register presentation defect c:
 * without a valueSpec the legend domain is stats-derived per run, so the same
 * color means different scores across runs/seeds).
 */
export const UNIT_SCORE_VALUE_SPEC: VizValueSpec = {
  scale: "linear",
  domain: { kind: "unit", min: 0, max: 1 },
  units: "score (0-1)",
};

/** Deterministic color for a placement category, drawn from the recipe's shared distinct pool. */
export function placementCategoryColor(index: number): VizRgbaColor {
  const colors = STANDARD_VIZ_STYLES["category.distinct"].colors;
  return colors[((index % colors.length) + colors.length) % colors.length] ?? colors[0];
}

/** Human label for an official RESOURCE_* symbol (policy-table identity). */
export function resourceTypeLabel(resourceType: string): string {
  const stripped = resourceType.replace(/^RESOURCE_/, "");
  return stripped
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
}

/**
 * Builds point buffers for plot-indexed categorical rows.
 * Rows with negative plot indices (unseated/unplaced sentinels) are skipped.
 */
export function buildPlacementPointBuffers(
  rows: ReadonlyArray<{ plotIndex: number; value: number }>,
  width: number
): { positions: Float32Array; values: Uint16Array; count: number } {
  const valid = rows.filter((row) => Number.isFinite(row.plotIndex) && row.plotIndex >= 0);
  const positions = new Float32Array(valid.length * 2);
  const values = new Uint16Array(valid.length);
  for (let i = 0; i < valid.length; i++) {
    const { plotIndex, value } = valid[i]!;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    positions[i * 2] = x;
    positions[i * 2 + 1] = y;
    values[i] = value;
  }
  return { positions, values, count: valid.length };
}

/** Convenience for transparent "none"/0 categories (audit presentation defect a). */
export function transparentNoneCategory(label = "None"): VizLayerCategory {
  return { value: 0, label, color: [148, 163, 184, 0] };
}
