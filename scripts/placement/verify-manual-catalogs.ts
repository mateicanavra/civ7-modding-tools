import { NATURAL_WONDER_CATALOG } from "../../packages/civ7-adapter/src/manual-catalogs/natural-wonders.ts";
import { DISCOVERY_CATALOG } from "../../packages/civ7-adapter/src/manual-catalogs/discoveries.ts";
import { CIV7_BROWSER_TABLES_V0 } from "../../apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts";

const expectedNaturalWonders = [
  "FEATURE_BARRIER_REEF",
  "FEATURE_VALLEY_OF_FLOWERS",
  "FEATURE_REDWOOD_FOREST",
  "FEATURE_GRAND_CANYON",
  "FEATURE_GULLFOSS",
  "FEATURE_HOERIKWAGGO",
  "FEATURE_IGUAZU_FALLS",
  "FEATURE_KILIMANJARO",
  "FEATURE_ZHANGJIAJIE",
  "FEATURE_THERA",
  "FEATURE_TORRES_DEL_PAINE",
  "FEATURE_ULURU",
];

const featureTable = CIV7_BROWSER_TABLES_V0.featureTypes;
const missingFeatures = expectedNaturalWonders.filter((name) => typeof featureTable[name] !== "number");
if (missingFeatures.length > 0) {
  throw new Error(`Missing natural wonder definitions in generated tables: ${missingFeatures.join(", ")}`);
}

const expectedIds = expectedNaturalWonders.map((name) => featureTable[name]);
const actualIds = NATURAL_WONDER_CATALOG.map((entry) => entry.featureType);
if (expectedIds.length !== actualIds.length) {
  throw new Error(`Natural wonder catalog length mismatch (expected ${expectedIds.length}, got ${actualIds.length}).`);
}

const missingIds = expectedIds.filter((id) => !actualIds.includes(id));
if (missingIds.length > 0) {
  throw new Error(`Manual natural wonder catalog missing IDs: ${missingIds.join(", ")}`);
}

const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
if (duplicates.length > 0) {
  throw new Error(`Natural wonder catalog contains duplicates: ${duplicates.join(", ")}`);
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; ++i) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash | 0;
}

const discoveryPairs = [
  ["IMPROVEMENT_CAVE", "BASIC"],
  ["IMPROVEMENT_CAVE", "INVESTIGATION"],
  ["IMPROVEMENT_RUINS", "BASIC"],
  ["IMPROVEMENT_RUINS", "INVESTIGATION"],
  ["IMPROVEMENT_CAMPFIRE", "BASIC"],
  ["IMPROVEMENT_CAMPFIRE", "INVESTIGATION"],
  ["IMPROVEMENT_TENTS", "BASIC"],
  ["IMPROVEMENT_TENTS", "INVESTIGATION"],
  ["IMPROVEMENT_PLAZA", "BASIC"],
  ["IMPROVEMENT_PLAZA", "INVESTIGATION"],
  ["IMPROVEMENT_CAIRN", "BASIC"],
  ["IMPROVEMENT_CAIRN", "INVESTIGATION"],
  ["IMPROVEMENT_RICH", "BASIC"],
  ["IMPROVEMENT_RICH", "INVESTIGATION"],
  ["IMPROVEMENT_WRECKAGE", "BASIC"],
  ["IMPROVEMENT_WRECKAGE", "INVESTIGATION"],
];

const expectedDiscoveryKeys = new Set(
  discoveryPairs.map(
    ([improvement, activation]) => `${hashString(improvement)}:${hashString(activation)}`
  )
);
const actualDiscoveryKeys = new Set(
  DISCOVERY_CATALOG.map((entry) => `${entry.discoveryVisualType}:${entry.discoveryActivationType}`)
);
if (expectedDiscoveryKeys.size !== actualDiscoveryKeys.size) {
  throw new Error(
    `Discovery catalog size mismatch (expected ${expectedDiscoveryKeys.size}, got ${actualDiscoveryKeys.size}).`
  );
}
for (const key of expectedDiscoveryKeys) {
  if (!actualDiscoveryKeys.has(key)) {
    throw new Error(`Discovery catalog missing entry ${key}`);
  }
}

console.log("Manual placement catalogs verified.");
