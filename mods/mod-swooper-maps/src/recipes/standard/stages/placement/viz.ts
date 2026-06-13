import type { VizLayerCategory, VizValueSpec } from "@swooper/mapgen-core";

/**
 * Stage-local viz vocabulary for placement (placement-realignment S7).
 *
 * The "Gameplay / Placement" group label was previously re-declared inline in
 * three step files (audit-register studio-viz lane); every placement emit
 * site imports it from here so the studio layer tree cannot drift per file.
 */
export const PLACEMENT_VIZ_GROUP = "Gameplay / Placement";

export const PLACEMENT_TILE_SPACE_ID = "tile.hexOddQ" as const;

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

const CATEGORY_PALETTE: ReadonlyArray<[number, number, number, number]> = [
  [59, 130, 246, 230],
  [239, 68, 68, 230],
  [34, 197, 94, 230],
  [245, 158, 11, 230],
  [168, 85, 247, 230],
  [14, 116, 144, 230],
  [249, 115, 22, 230],
  [99, 102, 241, 230],
  [236, 72, 153, 230],
  [20, 184, 166, 230],
  [132, 204, 22, 230],
  [217, 70, 239, 230],
  [234, 179, 8, 230],
  [6, 182, 212, 230],
  [244, 63, 94, 230],
  [16, 185, 129, 230],
];

/** Deterministic categorical color for an index (cycles a fixed palette). */
export function placementCategoryColor(index: number): [number, number, number, number] {
  return (
    CATEGORY_PALETTE[
      ((index % CATEGORY_PALETTE.length) + CATEGORY_PALETTE.length) % CATEGORY_PALETTE.length
    ] ?? [148, 163, 184, 220]
  );
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
