import type {
  DeepReadonly,
  JsonWireObject,
  JsonWireValue,
} from "@civ7/studio-contract";

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
export type ThemePreference = "system" | "light" | "dark";

// The former `Theme` token-bundle interface was removed with `createTheme()`:
// the chrome is themed by the single `.dark` class (shadcn strategy), so there is
// no runtime theme object to type. Components use token utility classes directly.

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

/** Data type option - what data is being visualized */
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

/** Render mode option (`kind[:role]`) - how a data type is rendered */
export interface RenderModeOption {
  value: string;
  label: string;
  icon?: string;
}

/** Variant option - semantic slice of the same dataType/render (e.g. era:2, season:1) */
export interface VariantOption {
  value: string;
  label: string;
}

/** Overlay option for correlation visualizations */
export interface OverlayOption {
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
  /** Map dimensions preset */
  mapSize: MapSize;
  /** Number of players (affects spawn placement) */
  playerCount: number;
  /** Resource distribution strategy */
  resources: ResourceMode;
}

export type MapSize =
  | "MAPSIZE_TINY"
  | "MAPSIZE_SMALL"
  | "MAPSIZE_STANDARD"
  | "MAPSIZE_LARGE"
  | "MAPSIZE_HUGE";
export type ResourceMode = "balanced" | "strategic";

// ============================================================================
// Pipeline Configuration Types
// ============================================================================

/**
 * Primitive config values that can appear in step configs.
 */
export type ConfigPrimitive = string | number | boolean | null;

/**
 * Immutable portable JSON retained by Studio after config admission.
 */
export type ConfigValue = DeepReadonly<JsonWireValue>;

/**
 * Complete immutable recipe config admitted against the active recipe schema.
 * The generic Studio boundary knows only that it is a portable JSON object;
 * each recipe owns the concrete required stage, knob, and step shape.
 */
export type PipelineConfig = DeepReadonly<JsonWireObject>;

// ============================================================================
// Config Patch Types
// ============================================================================

/**
 * Path-based config patch for efficient state updates.
 * Host app can use this to update config without deep cloning.
 */
export interface ConfigPatch {
  /** Path to the value being updated (e.g., ['foundation', 'knobs', 'plateCount']) */
  path: readonly string[];
  /** New value to set at the path */
  value: ConfigValue;
}

// ============================================================================
// Generation State Types
// ============================================================================

/** Current status of the generation process */
export type GenerationStatus = "ready" | "running" | "error";

// ============================================================================
// View State Types
// ============================================================================

/**
 * Visualization preferences for the map viewer.
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
  /** Active data type being visualized */
  selectedDataType: string;
  /** Render mode (`kind[:role]`) */
  selectedRenderMode: string;
}

// ============================================================================
// Component-owned re-homed types (structure-rewire §3.4)
// ============================================================================
// Types that live WITH their owning component but re-export through this
// barrel so `@swooper/mapgen-studio-ui/types` stays the single types surface.

export type { AppHeaderSetupState } from "../components/composites/AppHeader.js";
export type { StageView } from "../components/composites/StageViewTabs.js";
export type {
  WaterStatsLayerRef,
  WaterStatsRow,
  WaterStatsSummary,
} from "../components/composites/WaterStatsSection.js";
export type {
  BrowserConfigFormContext,
  ConfigCollapseContext,
} from "../components/forms/rjsfTemplates.js";
export type { GameConsoleLiveRuntime } from "../components/panels/GameConsole.js";
export type { RecipeDagLoadStatus } from "../components/panels/recipe-dag/PipelineStage.js";
export type { RunInGameRelation } from "../components/panels/statusLabels.js";
