/** Reusable contract and deterministic test double for Civ7 MapGen adapters. */

export {
  captureCurrentMapElevationSnapshot,
  captureCurrentMapLayer,
  captureCurrentRiverSurface,
  copyElevationIntent,
  deriveRiverProjectionFromCurrentSurface,
} from "./current-map-surface.js";
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
export type { MockAdapterConfig, MockPlotEffectType } from "./mock-adapter.js";
export { createMockAdapter, DEFAULT_PLOT_EFFECT_TYPES, MockAdapter } from "./mock-adapter.js";
export type {
  ContinentBounds,
  CurrentMapElevationSnapshot,
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
  ProjectedRiverClass,
  ResourceCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
  RiverCapabilities,
  RiverCapabilityAvailability,
  RiverDirection,
  RiverFinalizationArgs,
  RiverProjectionResult,
  RiverWriteIntent,
  VoronoiUtils,
} from "./types.js";
