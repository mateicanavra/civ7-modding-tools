import { DISCOVERY_CATALOG } from "../../packages/civ7-adapter/src/manual-catalogs/discoveries.ts";
import {
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintOffsets,
  hasUnsupportedNaturalWonderPolicyTags,
  NATURAL_WONDER_CATALOG,
  resolveNaturalWonderPlacementDirection,
} from "../../packages/civ7-map-policy/src/index.ts";

const featureTable = CIV7_BROWSER_TABLES_V0.featureTypes;
const featurePolicies = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  {
    placementClass?: string;
    naturalWonderDirection?: number;
    naturalWonderTiles?: number;
    naturalWonderPlaceFirst?: boolean;
  } | undefined
>;
const featureTags = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
  string,
  readonly string[] | undefined
>;
const expectedIds = Object.values(featureTable)
  .map((featureType) => Math.trunc(featureType))
  .filter((featureType) => {
    const policy = featurePolicies[String(featureType)];
    if (!policy?.naturalWonderTiles) return false;
    if (policy.naturalWonderPlaceFirst === true && policy.naturalWonderTiles > 1) return false;
    if (hasUnsupportedNaturalWonderPolicyTags(featureTags[String(featureType)])) return false;
    return (
      getNaturalWonderFootprintOffsets(
        policy,
        resolveNaturalWonderPlacementDirection(policy)
      ) !== null
    );
  })
  .sort((a, b) => a - b);
const actualIds = NATURAL_WONDER_CATALOG.map((entry) => entry.featureType);
if (expectedIds.length !== actualIds.length) {
  throw new Error(`Supported natural wonder catalog length mismatch (expected ${expectedIds.length}, got ${actualIds.length}).`);
}

const missingIds = expectedIds.filter((id) => !actualIds.includes(id));
if (missingIds.length > 0) {
  throw new Error(`Supported natural wonder catalog missing IDs: ${missingIds.join(", ")}`);
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

const toU32 = (value: number): number => value >>> 0;

const expectedDiscoveryKeys = new Set(
  discoveryPairs.map(
    ([improvement, activation]) => `${toU32(hashString(improvement))}:${toU32(hashString(activation))}`
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

console.log("Placement catalogs verified.");
