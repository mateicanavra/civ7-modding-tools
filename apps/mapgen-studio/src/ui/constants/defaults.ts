// ============================================================================
// DEFAULTS
// ============================================================================
// Default values for application state.
// Backend engineers: These can be overridden by server-provided defaults.
// ============================================================================

import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";

// ============================================================================
// Default World Settings
// ============================================================================

export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};
