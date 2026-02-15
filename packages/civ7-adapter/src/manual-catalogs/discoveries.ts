import type { DiscoveryCatalogEntry, DiscoveryPlacementDefaults } from "../types.js";

/**
 * Canonical unsigned discovery hashes (`u32`) for engine-facing placement.
 *
 * These values are adapter-owned constants mirrored from base-standard discovery
 * symbols and normalized into unsigned domain to avoid signed coercion drift.
 */
const BASIC_HASH = 210036031;
const INVESTIGATION_HASH = 2398750021;
const IMPROVEMENT_CAVE = 2687284451;
const IMPROVEMENT_RUINS = 2761684897;
const IMPROVEMENT_CAMPFIRE = 3557464341;
const IMPROVEMENT_TENTS = 2772546090;
const IMPROVEMENT_PLAZA = 2768331604;
const IMPROVEMENT_CAIRN = 2781061349;
const IMPROVEMENT_RICH = 2686684770;
const IMPROVEMENT_WRECKAGE = 1318962585;

export const DISCOVERY_CATALOG: DiscoveryCatalogEntry[] = [
  { discoveryVisualType: IMPROVEMENT_CAVE, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_CAVE, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_RUINS, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_RUINS, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_CAMPFIRE, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_CAMPFIRE, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_TENTS, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_TENTS, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_PLAZA, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_PLAZA, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_CAIRN, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_CAIRN, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_RICH, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_RICH, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: IMPROVEMENT_WRECKAGE, discoveryActivationType: BASIC_HASH },
  { discoveryVisualType: IMPROVEMENT_WRECKAGE, discoveryActivationType: INVESTIGATION_HASH },
];

export const DEFAULT_DISCOVERY_PLACEMENT: DiscoveryPlacementDefaults = {
  discoveryVisualType: DISCOVERY_CATALOG[0].discoveryVisualType,
  discoveryActivationType: DISCOVERY_CATALOG[0].discoveryActivationType,
};
