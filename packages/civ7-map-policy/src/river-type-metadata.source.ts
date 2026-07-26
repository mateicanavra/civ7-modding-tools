/**
 * Source metadata for Civ7 river type enum values.
 *
 * This hand-reviewed input generates both the map-policy browser tables and
 * the ambient Civ7 runtime declaration through `civ7-map-policy:generate`.
 */
export const CIV7_RIVER_TYPE_METADATA_SOURCE = {
  source: [
    "live-direct-control:2026-06-09:RiverTypes",
    "Base/modules/base-standard/data/unit-movement.xml",
    "Base/modules/base-standard/ui-next/tooltips/plot-tooltip/helpers.js",
  ],
  values: {
    NO_RIVER: -1,
    RIVER_MINOR: 0,
    RIVER_NAVIGABLE: 1,
  },
} as const;
