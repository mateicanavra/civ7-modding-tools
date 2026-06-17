import {
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintOffsets,
  hasUnsupportedNaturalWonderPolicyTags,
  NATURAL_WONDER_CATALOG,
  resolveNaturalWonderPlacementDirection,
} from "@civ7/map-policy";

const featureTable = CIV7_BROWSER_TABLES_V0.featureTypes;
const featurePolicies = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  | {
      placementClass?: string;
      naturalWonderDirection?: number;
      naturalWonderTiles?: number;
      naturalWonderPlaceFirst?: boolean;
    }
  | undefined
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
      getNaturalWonderFootprintOffsets(policy, resolveNaturalWonderPlacementDirection(policy)) !==
      null
    );
  })
  .sort((a, b) => a - b);
const actualIds = NATURAL_WONDER_CATALOG.map((entry) => entry.featureType);
if (expectedIds.length !== actualIds.length) {
  throw new Error(
    `Supported natural wonder catalog length mismatch (expected ${expectedIds.length}, got ${actualIds.length}).`
  );
}

const missingIds = expectedIds.filter((id) => !actualIds.includes(id));
if (missingIds.length > 0) {
  throw new Error(`Supported natural wonder catalog missing IDs: ${missingIds.join(", ")}`);
}

const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
if (duplicates.length > 0) {
  throw new Error(`Natural wonder catalog contains duplicates: ${duplicates.join(", ")}`);
}

console.log("Placement catalogs verified.");
