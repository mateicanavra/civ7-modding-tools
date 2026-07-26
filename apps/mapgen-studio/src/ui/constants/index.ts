// ============================================================================
// CONSTANTS INDEX
// ============================================================================
// App-local constants used through the directory import.
// ============================================================================

// Options for dropdowns and selectors
export { MAP_SIZE_OPTIONS, PLAYER_COUNT_OPTIONS } from "./options";

// ============================================================================
// Utility Lookups
// ============================================================================

import { MAP_SIZE_OPTIONS } from "./options";

/** Map size value to short label (e.g., 'MAPSIZE_TINY' -> 'Tiny') */
export const MAP_SIZE_SHORT: Record<string, string> = Object.fromEntries(
  MAP_SIZE_OPTIONS.map((opt) => [opt.value, opt.label])
);
