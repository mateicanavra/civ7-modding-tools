// ============================================================================
// CONSTANTS INDEX
// ============================================================================
// Re-exports all constants from organized modules.
// ============================================================================

// Options for dropdowns and selectors
export {
  // World settings options
  WORLD_MODE_OPTIONS,
  MAP_SIZE_OPTIONS,
  PLAYER_COUNT_OPTIONS,
  RESOURCE_MODE_OPTIONS,
  // Default options (can be overridden via props)
  DEFAULT_RECIPE_OPTIONS,
  DEFAULT_PRESET_OPTIONS,
  DEFAULT_DATA_TYPE_OPTIONS,
  DEFAULT_RENDER_MODE_OPTIONS,
  DEFAULT_KNOB_OPTIONS,
  // Types
  type MapSizeOption,
  // Legacy exports
  RECIPE_OPTIONS,
  PRESET_OPTIONS,
  LAYER_OPTIONS,
  PROJECTION_OPTIONS,
  KNOB_OPTIONS } from
'./options';

// Default values
export {
  DEFAULT_WORLD_SETTINGS,
  DEFAULT_RECIPE_SETTINGS,
  DEFAULT_VIEW_STATE } from
'./defaults';

// Layout constants
export { LAYOUT, type LayoutConfig } from './layout';

// ============================================================================
// Utility Lookups
// ============================================================================

import { MAP_SIZE_OPTIONS } from './options';

/** Map size value to full label (e.g., 'MAPSIZE_TINY' -> 'Tiny (60×38)') */
export const MAP_SIZE_LABELS: Record<string, string> = Object.fromEntries(
  MAP_SIZE_OPTIONS.map((opt) => [
  opt.value,
  `${opt.label} (${opt.dimensions})`]
  )
);

/** Map size value to short label (e.g., 'MAPSIZE_TINY' -> 'Tiny') */
export const MAP_SIZE_SHORT: Record<string, string> = Object.fromEntries(
  MAP_SIZE_OPTIONS.map((opt) => [opt.value, opt.label])
);

// ============================================================================
// Legacy Aliases (for backward compatibility)
// ============================================================================

export { WORLD_MODE_OPTIONS as MODE_OPTIONS } from './options';
export { RESOURCE_MODE_OPTIONS as RESOURCES_OPTIONS } from './options';
export { DEFAULT_WORLD_SETTINGS as DEFAULT_GLOBAL_SETTINGS } from './defaults';
export { DEFAULT_RECIPE_SETTINGS as DEFAULT_RUN_SETTINGS } from './defaults';