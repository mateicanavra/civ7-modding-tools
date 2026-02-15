import type { DiscoveryCatalogEntry, DiscoveryPlacementDefaults } from "../types.js";

const BASIC_HASH = 210036031;
const INVESTIGATION_HASH = -1896217275;

export const DISCOVERY_CATALOG: DiscoveryCatalogEntry[] = [
  { discoveryVisualType: -1607682845, discoveryActivationType: BASIC_HASH }, // CAVE
  { discoveryVisualType: -1607682845, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: -1533282399, discoveryActivationType: BASIC_HASH }, // RUINS
  { discoveryVisualType: -1533282399, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: -737502955, discoveryActivationType: BASIC_HASH }, // CAMPFIRE
  { discoveryVisualType: -737502955, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: -1522421206, discoveryActivationType: BASIC_HASH }, // TENTS
  { discoveryVisualType: -1522421206, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: -1526635692, discoveryActivationType: BASIC_HASH }, // PLAZA
  { discoveryVisualType: -1526635692, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: -1513905947, discoveryActivationType: BASIC_HASH }, // CAIRN
  { discoveryVisualType: -1513905947, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: -1608282526, discoveryActivationType: BASIC_HASH }, // RICH
  { discoveryVisualType: -1608282526, discoveryActivationType: INVESTIGATION_HASH },
  { discoveryVisualType: 1318962585, discoveryActivationType: BASIC_HASH }, // WRECKAGE
  { discoveryVisualType: 1318962585, discoveryActivationType: INVESTIGATION_HASH },
];

export const DEFAULT_DISCOVERY_PLACEMENT: DiscoveryPlacementDefaults = {
  discoveryVisualType: DISCOVERY_CATALOG[0].discoveryVisualType,
  discoveryActivationType: DISCOVERY_CATALOG[0].discoveryActivationType,
};
