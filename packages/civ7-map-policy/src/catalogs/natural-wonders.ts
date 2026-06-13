import type { NaturalWonderCatalogEntry } from "../types.js";
import { CIV7_BROWSER_TABLES_V0 } from "../civ7-tables.gen.js";
import {
  getNaturalWonderFootprintOffsets,
  hasUnsupportedNaturalWonderPolicyTags,
  resolveNaturalWonderPlacementDirection,
} from "../natural-wonder-footprints.js";

/**
 * Generated natural-wonder catalog, const-backed to avoid runtime reads.
 * Source: feature order is stable per `CIV7_BROWSER_TABLES_V0.featureTypes`;
 * support is derived from generated Civ feature policy rows.
 */
const { featureTypes } = CIV7_BROWSER_TABLES_V0;
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

function naturalWonderDirection(featureType: number): number {
  return resolveNaturalWonderPlacementDirection(featurePolicies[String(featureType)] ?? {});
}

function isSupportedNaturalWonder(featureType: number): boolean {
  const policy = featurePolicies[String(featureType)];
  if (!policy || !policy.naturalWonderTiles) return false;
  if (policy.naturalWonderPlaceFirst === true && policy.naturalWonderTiles > 1) return false;
  if (hasUnsupportedNaturalWonderPolicyTags(featureTags[String(featureType)])) return false;
  return getNaturalWonderFootprintOffsets(policy, naturalWonderDirection(featureType)) !== null;
}

const NATURAL_WONDER_CANDIDATES: NaturalWonderCatalogEntry[] = Object.values(featureTypes)
  .map((featureType) => Math.trunc(featureType))
  .filter((featureType) => Number.isFinite(featureType))
  .map((featureType) => ({
    featureType,
    direction: naturalWonderDirection(featureType),
  }))
  .sort((a, b) => a.featureType - b.featureType);

export const NATURAL_WONDER_CATALOG: NaturalWonderCatalogEntry[] = NATURAL_WONDER_CANDIDATES.filter(
  (entry) => isSupportedNaturalWonder(entry.featureType)
);
