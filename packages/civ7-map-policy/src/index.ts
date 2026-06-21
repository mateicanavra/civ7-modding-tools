export { isSupportedNaturalWonder, NATURAL_WONDER_CATALOG } from "./catalogs/natural-wonders.js";
export type {
  Civ7BrowserTablesV0,
  Civ7MapResourceMinimumAmountModifierRowV1,
  Civ7PolicyTablesV1,
  Civ7ResourceRowV1,
  Civ7StartBiasScoreRowV1,
  Civ7StartBiasValueRowV1,
} from "./civ7-tables.gen.js";
export { CIV7_BROWSER_TABLES_V0, CIV7_POLICY_TABLES_V1 } from "./civ7-tables.gen.js";
export {
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
  WATER_CLASS_OCEAN,
} from "./coast-classification.js";
export type { CoastRingPolicyResult } from "./coast-ring.js";
export { applyCiv7CoastRingPolicy, CIV7_COAST_RING_POLICY_V0 } from "./coast-ring.js";
export type {
  NaturalWonderFootprintOffset,
  NaturalWonderFootprintOffsetsByParity,
  NaturalWonderPlacementPolicy,
} from "./natural-wonder-footprints.js";
export {
  getNaturalWonderFootprintIndices,
  getNaturalWonderFootprintOffsets,
  getNaturalWonderFootprintOffsetsByParity,
  hasUnsupportedNaturalWonderPolicyTags,
  resolveNaturalWonderMaterializationDirection,
  resolveNaturalWonderPlacementDirection,
} from "./natural-wonder-footprints.js";
export {
  isResourceAdjacentToLandRuntimeOptional,
  NO_RESOURCE,
  PLACEABLE_RESOURCE_TYPE_IDS,
  RESOURCE_ADJACENT_TO_LAND_RUNTIME_OPTIONAL_TYPE_IDS,
} from "./resource-constants.js";
export {
  CIV7_DEFAULT_RIVER_MODELING_ARGS,
  CIV7_RIVER_MODELING_POLICY_V0,
  CIV7_RIVER_TYPES_V0,
  NO_RIVER_TYPE,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "./river-constants.js";
export { CIV7_RIVER_TYPE_METADATA_SOURCE } from "./river-type-metadata.source.js";
export type { HomelandRegionSlot, StartApportionmentInput } from "./starts.js";
export {
  apportionStartsByCapacity,
  balancedHemisphereMeridian,
  CIV7_START_PLACEMENT_POLICY_V0,
  dispersionTerm,
  feasibleStartCeiling,
  HOMELAND_REGION_EAST,
  HOMELAND_REGION_WEST,
  hemisphereSlotForColumn,
  startFootprintTiles,
} from "./starts.js";
export type {
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
  DiscoveryPlacementRejectionReason,
  NaturalWonderCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementMismatchReason,
  ResourcePlacementOutcome,
  ResourcePlacementRejectionReason,
} from "./types.js";
