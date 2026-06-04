export { CIV7_BROWSER_TABLES_V0 } from "./civ7-tables.gen.js";
export type { Civ7BrowserTablesV0 } from "./civ7-tables.gen.js";

export { NO_RESOURCE, PLACEABLE_RESOURCE_TYPE_IDS } from "./resource-constants.js";
export { NATURAL_WONDER_CATALOG } from "./catalogs/natural-wonders.js";
export { DISCOVERY_CATALOG } from "./catalogs/discoveries.js";
export {
  getNaturalWonderFootprintIndices,
  getNaturalWonderFootprintOffsets,
  hasUnsupportedNaturalWonderPolicyTags,
  resolveNaturalWonderPlacementDirection,
} from "./natural-wonder-footprints.js";
export type {
  NaturalWonderFootprintOffset,
  NaturalWonderPlacementPolicy,
} from "./natural-wonder-footprints.js";
export {
  CIV7_COAST_CLASSIFICATION_POLICY_V0,
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
  WATER_CLASS_OCEAN,
  applyCiv7CoastClassificationPolicy,
} from "./coast-classification.js";
export type { CoastClassificationPolicyResult } from "./coast-classification.js";
export {
  CIV7_BUILD_ELEVATION_BOUNDARY_POLICY_V0,
  applyCiv7BuildElevationBoundaryPolicy,
} from "./elevation-boundary.js";
export type { BuildElevationBoundaryPolicyResult } from "./elevation-boundary.js";
export type {
  DiscoveryCatalogEntry,
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
  DiscoveryPlacementRejectionReason,
  NaturalWonderCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
} from "./types.js";
