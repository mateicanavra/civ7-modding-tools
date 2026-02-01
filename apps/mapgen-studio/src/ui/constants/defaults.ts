// ============================================================================
// DEFAULTS
// ============================================================================
// Default values for application state.
// Backend engineers: These can be overridden by server-provided defaults.
// ============================================================================

import type { WorldSettings, RecipeSettings, ViewState } from '../types';

// ============================================================================
// Default World Settings
// ============================================================================

export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  mode: 'browser',
  mapSize: 'MAPSIZE_STANDARD',
  playerCount: 6,
  resources: 'balanced'
};

// ============================================================================
// Default Recipe Settings
// ============================================================================

export const DEFAULT_RECIPE_SETTINGS: RecipeSettings = {
  recipe: 'mod-swooper-maps/standard',
  preset: 'none',
  seed: '123'
};

// ============================================================================
// Default View State
// Renamed: selectedLayer → selectedDataType, selectedProjection → selectedRenderMode
// ============================================================================

export const DEFAULT_VIEW_STATE: ViewState = {
  showEdges: true,
  showGrid: true,
  selectedStage: 'foundation',
  selectedStep: 'computeMesh',
  selectedDataType: 'mesh',
  selectedRenderMode: 'hexagonal'
};