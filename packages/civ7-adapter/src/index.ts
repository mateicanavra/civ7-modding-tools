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

// Re-export types
export type {
  EngineAdapter,
  FeatureData,
  MapDimensions,
  MapInitParams,
  MapSizeId,
  MapInfo,
  MapContext,
  ContinentBounds,
  PlotTagName,
  LandmassIdName,
  VoronoiUtils,
  DiscoveryCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
  ResourcePlacementMismatchReason,
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
  DiscoveryPlacementRejectionReason,
} from "./types.js";
export { ENGINE_EFFECT_TAGS } from "./effects.js";
export type { EngineEffectTagId } from "./effects.js";
export {
  CIV7_BROWSER_TABLES_V0,
  DISCOVERY_CATALOG,
  NATURAL_WONDER_CATALOG,
  NO_RESOURCE,
  PLACEABLE_RESOURCE_TYPE_IDS,
  getNaturalWonderFootprintIndices,
  getNaturalWonderFootprintOffsets,
  hasUnsupportedNaturalWonderPolicyTags,
  resolveNaturalWonderPlacementDirection,
} from "@civ7/map-policy";
export type {
  Civ7BrowserTablesV0,
  NaturalWonderFootprintOffset,
  NaturalWonderPlacementPolicy,
} from "@civ7/map-policy";
export {
  CIV7_MAP_INFO_BY_TYPE,
  CIV7_MAP_SIZE_TYPES,
  DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
  getCiv7MapInfo,
  getCiv7MapInfoByDimensions,
  getCiv7MapSizeTypeByDimensions,
} from "./map-size-info.js";
export type { Civ7LatitudeBounds, Civ7MapSizeType } from "./map-size-info.js";

// Re-export mock adapter (safe to import anywhere)
export { MockAdapter, createMockAdapter } from "./mock-adapter.js";
export type { MockAdapterConfig } from "./mock-adapter.js";

// Note: Civ7Adapter is NOT re-exported from index to prevent accidental
// bundling of /base-standard/... imports. Import it explicitly from:
//   import { Civ7Adapter, createCiv7Adapter } from "@civ7/adapter/civ7";
