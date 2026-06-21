import {
  CIV7_BROWSER_TABLES_V0,
  isSupportedNaturalWonder,
  NATURAL_WONDER_CATALOG,
} from "@civ7/map-policy";

// Mirror consistency check: both the catalog and this verifier derive eligibility
// from the single exported `isSupportedNaturalWonder` predicate, so they cannot
// disagree (no second copy of the support filter to drift).
const featureTable = CIV7_BROWSER_TABLES_V0.featureTypes;
const expectedIds = Object.values(featureTable)
  .map((featureType) => Math.trunc(featureType))
  .filter((featureType) => isSupportedNaturalWonder(featureType))
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
