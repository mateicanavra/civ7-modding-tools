// ============================================================================
// CONSTANTS INDEX
// ============================================================================
// Re-exports all constants from organized modules.
// ============================================================================

// Default values
export {
  DEFAULT_RECIPE_SETTINGS,
  DEFAULT_VIEW_STATE,
  DEFAULT_WORLD_SETTINGS,
} from "./defaults";
// Options for dropdowns and selectors
export {
  DEFAULT_DATA_TYPE_OPTIONS,
  DEFAULT_KNOB_OPTIONS,
  DEFAULT_PRESET_OPTIONS,
  // Default options (can be overridden via props)
  DEFAULT_RECIPE_OPTIONS,
  DEFAULT_RENDER_MODE_OPTIONS,
  MAP_SIZE_OPTIONS,
  // Types
  type MapSizeOption,
  PLAYER_COUNT_OPTIONS,
  RESOURCE_MODE_OPTIONS,
} from "./options";

// ============================================================================
// Utility Lookups
// ============================================================================

import { MAP_SIZE_OPTIONS } from "./options";

/** Map size value to full label (e.g., 'MAPSIZE_TINY' -> 'Tiny (60×38)') */
export const MAP_SIZE_LABELS: Record<string, string> = Object.fromEntries(
  MAP_SIZE_OPTIONS.map((opt) => [opt.value, `${opt.label} (${opt.dimensions})`])
);

/** Map size value to short label (e.g., 'MAPSIZE_TINY' -> 'Tiny') */
export const MAP_SIZE_SHORT: Record<string, string> = Object.fromEntries(
  MAP_SIZE_OPTIONS.map((opt) => [opt.value, opt.label])
);
