/**
 * @civ7/adapter - Centralized adapter for Civ7 engine APIs
 *
 * This package is the ONLY place allowed to import /base-standard/... paths.
 * All other packages must consume the EngineAdapter interface.
 *
 * Usage:
 *   // In production (mod code):
 *   import { createCiv7Adapter } from "@civ7/adapter/civ7";
 *
 *   // In tests:
 *   import { createMockAdapter } from "@civ7/adapter/mock";
 *
 *   // For types only:
 *   import type { EngineAdapter } from "@civ7/adapter";
 */

export type {
  Civ7GameOptionDescriptor,
  Civ7MapOptionDescriptor,
  Civ7PlayerOptionDescriptor,
} from "@civ7/map-policy/setup";
export {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
} from "@civ7/map-policy/setup";
export type { EngineEffectTagId } from "./effects.js";
export { ENGINE_EFFECT_TAGS } from "./effects.js";
export type {
  Civ7MapGenerationLatitudeBounds,
  Civ7MapGenerationSetupCapture,
  Civ7MapGenerationSetupCaptureInput,
  Civ7MapInfoSnapshot,
  Civ7PlayerSetupOptionEvidence,
  Civ7SetupOptionEvidence,
  Civ7SetupOptionEvidenceForDescriptor,
  Civ7SetupOptionEvidenceForDescriptors,
  Civ7SetupOptionUnavailableReason,
  Civ7SetupOptionValue,
  Civ7StartSlotCapacity,
} from "./map-generation-setup.js";
export { captureCiv7MapGenerationSetup } from "./map-generation-setup.js";
export type {
  Civ7MapInfo,
  Civ7RowLatitudeEndpoints,
  Civ7StandardMapInfo,
  Civ7StandardMapSizeId,
  Civ7StandardMapSizePreset,
} from "./map-metadata.js";
export {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS,
  findCiv7StandardMapSizePreset,
  findCiv7StandardMapSizePresetForMapInfo,
  getCiv7RowLatitude,
  getCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePresetForDimensions,
  interpolateCiv7RowLatitude,
} from "./map-metadata.js";
export type { MockAdapterConfig } from "./mock-adapter.js";
// Re-export mock adapter (safe to import anywhere)
export { createMockAdapter, MockAdapter } from "./mock-adapter.js";
// Re-export types
export type {
  ContinentBounds,
  CurrentRiverSurface,
  EngineAdapter,
  EngineAdapterMethodKey,
  FeatureData,
  LakeProjectionResult,
  LandmassIdName,
  MapDimensions,
  MapInfo,
  MapInitParams,
  MapSizeId,
  NaturalWonderFootprintReadback,
  NaturalWonderFootprintReadbackStatus,
  NaturalWonderPlacementOutcome,
  NaturalWonderPlacementRejectionReason,
  OfficialDiscoveryGenerationResult,
  PlotTagName,
  ResourceCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
  RiverProjectionResult,
  VoronoiUtils,
} from "./types.js";

// Note: Civ7Adapter is NOT re-exported from index to prevent accidental
// bundling of /base-standard/... imports. Import it explicitly from:
//   import { Civ7Adapter, createCiv7Adapter } from "@civ7/adapter/civ7";
