// ============================================================================
// TYPES INDEX
// ============================================================================
// This file defines all TypeScript types for the application.
// Backend engineers: These types define the data contracts between
// frontend and backend. Pay special attention to API types.
// ============================================================================

// ============================================================================
// Theme & UI Types
// ============================================================================

/** User's theme preference - 'system' follows OS setting */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Theme tokens for consistent styling across components */
export interface Theme {
  container: string;
  card: string;
  nestedCard: string;
  deepNestedCard: string;
  text: string;
  textBright: string;
  label: string;
  muted: string;
  sectionTitle: string;
  subtitle: string;
  input: string;
  button: string;
  primaryButton: string;
  checkbox: string;
  hoverBg: string;
  tabActive: string;
  tabInactive: string;
  toggleActive: string;
  toggleInactive: string;
  divider: string;
  strategyBadge: string;
}

// ============================================================================
// Option Types (for controlled components)
// ============================================================================

/** Generic option for select/dropdown components */
export interface SelectOption<T = string> {
  value: T;
  label: string;
}

/** Stage option for pipeline navigation */
export interface StageOption {
  value: string;
  label: string;
  index: number;
}

/** Step option for pipeline navigation */
export interface StepOption {
  value: string;
  label: string;
  category: string;
}

/** Data type option (formerly "layer") - what data is being visualized */
export interface DataTypeOption {
  value: string;
  label: string;
  group?: string;
}

/** Space option - which coordinate space a data type is shown in */
export interface SpaceOption {
  value: string;
  label: string;
}

/** Render mode option (formerly "projection") - how data is rendered/transformed */
export interface RenderModeOption {
  value: string;
  label: string;
  icon?: string;
}

/** Variant option - specific variant of a render mode */
export interface VariantOption {
  value: string;
  label: string;
}

/** Knob options mapping - knob name to available values */
export type KnobOptionsMap = Record<string, readonly string[]>;

// ============================================================================
// World Settings Types
// ============================================================================

/**
 * Global world generation settings.
 * These are high-level parameters that affect the entire generation.
 *
 * Backend: These should be validated server-side before generation.
 */
export interface WorldSettings {
  /** Generation mode - affects output format */
  mode: WorldMode;
  /** Map dimensions preset */
  mapSize: MapSize;
  /** Number of players (affects spawn placement) */
  playerCount: number;
  /** Resource distribution strategy */
  resources: ResourceMode;
}

export type WorldMode = 'browser' | 'dump';
export type MapSize =
'MAPSIZE_TINY' |
'MAPSIZE_SMALL' |
'MAPSIZE_STANDARD' |
'MAPSIZE_LARGE' |
'MAPSIZE_HUGE';
export type ResourceMode = 'balanced' | 'strategic';

// ============================================================================
// Recipe & Preset Types
// ============================================================================

/**
 * Recipe settings for a generation run.
 *
 * Backend: The recipe determines which pipeline stages to execute.
 * The preset can override default config values.
 */
export interface RecipeSettings {
  /** Recipe identifier (e.g., 'mod-swooper-maps/standard') */
  recipe: string;
  /** Preset identifier (e.g., 'none', 'archipelago') */
  preset: string;
  /** Random seed for reproducible generation */
  seed: string;
}

// ============================================================================
// Pipeline Configuration Types
// ============================================================================

/**
 * Primitive config values that can appear in step configs.
 */
export type ConfigPrimitive = string | number | boolean | null;

/**
 * Recursive config value type - can be primitive, array, or nested object.
 */
export type ConfigValue =
ConfigPrimitive |
ConfigValue[] |
{[key: string]: ConfigValue;};

/**
 * Configuration for a single pipeline step.
 *
 * Backend: Each step has a strategy (algorithm variant) and config params.
 */
export interface StepConfig {
  /** Algorithm variant to use (e.g., 'default', 'experimental') */
  strategy?: string;
  /** Step-specific configuration parameters */
  config?: Record<string, ConfigValue>;
  /** Additional properties for extensibility */
  [key: string]: ConfigValue | undefined;
}

/**
 * Configuration for a pipeline stage (contains multiple steps).
 *
 * Backend: Stages are executed in order. Each stage can have:
 * - knobs: High-level presets that map to multiple config values
 * - advanced: Detailed step-by-step configuration
 */
export interface StageConfig {
  /** High-level knobs (e.g., 'plateCount': 'normal') */
  knobs?: Record<string, string>;
  /** Advanced step configurations grouped by category */
  advanced?: Record<string, StepConfig> | Record<string, Record<string, StepConfig>>;
  /** Additional stage-specific groups */
  [key: string]: unknown;
}

/**
 * Complete pipeline configuration.
 * Keys are stage names (e.g., 'foundation', 'morphology-pre').
 *
 * Backend: This is the primary configuration object sent to the generation API.
 */
export type PipelineConfig = Record<string, StageConfig>;

// ============================================================================
// Config Patch Types
// ============================================================================

/**
 * Path-based config patch for efficient state updates.
 * Host app can use this to update config without deep cloning.
 */
export interface ConfigPatch {
  /** Path to the value being updated (e.g., ['foundation', 'knobs', 'plateCount']) */
  path: string[];
  /** New value to set at the path */
  value: ConfigValue;
}

// ============================================================================
// Generation State Types
// ============================================================================

/** Current status of the generation process */
export type GenerationStatus = 'ready' | 'running' | 'error';

/**
 * Complete state for a generation run.
 *
 * Backend: This represents the full context needed to execute a generation.
 */
export interface GenerationState {
  status: GenerationStatus;
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  pipelineConfig: PipelineConfig;
}

/**
 * Result of a completed generation run.
 *
 * Backend: Return this structure from the generation API.
 */
export interface GenerationResult {
  /** Unique identifier for this generation */
  id: string;
  /** Seed used (may differ from input if auto-generated) */
  seed: string;
  /** Timestamp of completion */
  completedAt: string;
  /** Settings used for this run */
  worldSettings: WorldSettings;
  /** Any warnings or info messages */
  messages?: string[];
  /** Error message if status is 'error' */
  error?: string;
}

// ============================================================================
// View State Types
// ============================================================================

/**
 * Visualization preferences for the map viewer.
 * Renamed: layer → dataType, projection → renderMode
 */
export interface ViewState {
  /** Show edge/boundary lines */
  showEdges: boolean;
  /** Show background grid */
  showGrid: boolean;
  /** Currently selected pipeline stage (e.g., 'foundation') */
  selectedStage: string;
  /** Currently selected pipeline step (e.g., 'computeMesh') */
  selectedStep: string;
  /** Active data type being visualized (formerly "layer") */
  selectedDataType: string;
  /** Render mode / transform (formerly "projection") */
  selectedRenderMode: string;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Request payload for starting a generation.
 *
 * Backend: POST /api/generate
 */
export interface GenerateRequest {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  pipelineConfig: PipelineConfig;
}

/**
 * Response from generation API.
 *
 * Backend: Returns immediately with job ID, or waits for completion.
 */
export interface GenerateResponse {
  /** Job ID for async tracking */
  jobId: string;
  /** Status of the generation */
  status: GenerationStatus;
  /** Result if completed synchronously */
  result?: GenerationResult;
}

/**
 * Request to save a preset.
 *
 * Backend: POST /api/presets
 */
export interface SavePresetRequest {
  name: string;
  description?: string;
  pipelineConfig: PipelineConfig;
  worldSettings?: Partial<WorldSettings>;
}

/**
 * Preset definition.
 *
 * Backend: GET /api/presets returns array of these.
 */
export interface Preset {
  id: string;
  name: string;
  description?: string;
  pipelineConfig: PipelineConfig;
  worldSettings?: Partial<WorldSettings>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Legacy Aliases (for backward compatibility)
// ============================================================================

/** @deprecated Use WorldSettings instead */
export type GlobalSettings = WorldSettings;

/** @deprecated Use RecipeSettings instead */
export type RunSettings = RecipeSettings;

/** @deprecated Use selectedDataType instead */
export type SelectedLayer = string;

/** @deprecated Use selectedRenderMode instead */
export type SelectedProjection = string;
