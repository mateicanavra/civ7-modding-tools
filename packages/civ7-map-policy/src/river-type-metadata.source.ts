/**
 * Source metadata for Civ7 river type enum values.
 *
 * This is the hand-reviewed input used by the generated Civ7 browser tables.
 * Keep the generated map-policy and Studio table copies in sync with this
 * source through `bun run mapgen-studio:gen-civ7-tables`.
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
