import {
  defineVizMeta,
  type VizDataTypeKey,
  type VizLayerCategory,
  type VizLayerMeta,
  type VizResolvedPalette,
  type VizRgbaColor,
} from "@swooper/mapgen-viz";

type StandardVizMetaOverrides = Omit<Partial<VizLayerMeta>, "palette" | "categories">;

/**
 * Stable semantic colors shared by Standard recipe visualizations.
 * `absent` is reserved for an explicit categorical absence value; unknown observations stay
 * visible so missing evidence cannot disappear into the canvas.
 */
export const STANDARD_VIZ_COLORS = {
  absent: [0, 0, 0, 0],
  unknown: [107, 114, 128, 230],
  water: {
    ocean: [15, 59, 102, 235],
    coast: [56, 189, 248, 235],
  },
  land: [73, 113, 62, 235],
  ice: [224, 242, 254, 240],
  vegetation: [34, 139, 94, 235],
  field: {
    negative: [59, 130, 246, 235],
    neutral: [107, 114, 128, 230],
    positive: [239, 68, 68, 235],
    low: [107, 114, 128, 230],
    moderate: [59, 130, 246, 235],
    elevated: [34, 197, 94, 235],
    high: [245, 158, 11, 235],
  },
} as const satisfies Readonly<{
  absent: VizRgbaColor;
  unknown: VizRgbaColor;
  water: Readonly<{ ocean: VizRgbaColor; coast: VizRgbaColor }>;
  land: VizRgbaColor;
  ice: VizRgbaColor;
  vegetation: VizRgbaColor;
  field: Readonly<{
    negative: VizRgbaColor;
    neutral: VizRgbaColor;
    positive: VizRgbaColor;
    low: VizRgbaColor;
    moderate: VizRgbaColor;
    elevated: VizRgbaColor;
    high: VizRgbaColor;
  }>;
}>;

/**
 * Standard recipe palette selections resolved to portable colors before Studio observes them.
 * These seven styles are semantic authoring choices, not renderer identifiers or a runtime
 * registry; consumers receive only their `VizResolvedPalette` values.
 */
export const STANDARD_VIZ_STYLES = {
  "water.depth": {
    kind: "continuous",
    stops: [STANDARD_VIZ_COLORS.water.ocean, STANDARD_VIZ_COLORS.water.coast],
  },
  "terrain.elevation": {
    kind: "continuous",
    stops: [STANDARD_VIZ_COLORS.land, STANDARD_VIZ_COLORS.field.high, STANDARD_VIZ_COLORS.ice],
  },
  "climate.temperature": {
    kind: "continuous",
    stops: [
      STANDARD_VIZ_COLORS.ice,
      STANDARD_VIZ_COLORS.field.negative,
      STANDARD_VIZ_COLORS.field.high,
      STANDARD_VIZ_COLORS.field.positive,
    ],
  },
  "climate.moisture": {
    kind: "continuous",
    stops: [
      STANDARD_VIZ_COLORS.field.high,
      STANDARD_VIZ_COLORS.vegetation,
      STANDARD_VIZ_COLORS.water.coast,
    ],
  },
  "field.signed": {
    kind: "continuous",
    stops: [
      STANDARD_VIZ_COLORS.field.negative,
      STANDARD_VIZ_COLORS.field.neutral,
      STANDARD_VIZ_COLORS.field.positive,
    ],
  },
  "field.intensity": {
    kind: "continuous",
    stops: [
      STANDARD_VIZ_COLORS.field.low,
      STANDARD_VIZ_COLORS.field.moderate,
      STANDARD_VIZ_COLORS.field.elevated,
      STANDARD_VIZ_COLORS.field.high,
    ],
  },
  "category.distinct": {
    kind: "categorical",
    colors: [
      [0, 114, 178, 235],
      [230, 159, 0, 235],
      [0, 158, 115, 235],
      [204, 121, 167, 235],
      [86, 180, 233, 235],
      [213, 94, 0, 235],
      [240, 228, 66, 235],
      STANDARD_VIZ_COLORS.unknown,
    ],
  },
} as const satisfies Readonly<Record<string, VizResolvedPalette>>;

/** Recipe-owned semantic style choices accepted by `defineStandardVizMeta`. */
export type StandardVizStyle = keyof typeof STANDARD_VIZ_STYLES;

/**
 * Resolves a Standard recipe style into portable layer metadata.
 * Callers may describe layer semantics but cannot replace the style palette or add a competing
 * category authority; explicit category tables use `defineStandardVizCategoryMeta` instead.
 */
export function defineStandardVizMeta(
  dataTypeKey: VizDataTypeKey,
  style: StandardVizStyle,
  meta: StandardVizMetaOverrides = {}
): VizLayerMeta {
  return defineVizMeta(dataTypeKey, {
    ...meta,
    palette: STANDARD_VIZ_STYLES[style],
  });
}

/**
 * Defines a locally owned categorical identity table without a competing shared color pool.
 * Category values must be nonempty and unique; the portable materializer validates that law and
 * snapshots each color before any binary evidence crosses an adapter boundary.
 */
export function defineStandardVizCategoryMeta(
  dataTypeKey: VizDataTypeKey,
  categories: readonly [VizLayerCategory, ...VizLayerCategory[]],
  meta: StandardVizMetaOverrides = {}
): VizLayerMeta {
  return defineVizMeta(dataTypeKey, {
    ...meta,
    palette: { kind: "categorical" },
    categories,
  });
}
