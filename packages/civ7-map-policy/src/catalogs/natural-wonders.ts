import type { NaturalWonderCatalogEntry } from "../types.js";
import { CIV7_BROWSER_TABLES_V0 } from "../civ7-tables.gen.js";
import {
  getNaturalWonderFootprintOffsets,
  hasUnsupportedNaturalWonderPolicyTags,
  resolveNaturalWonderPlacementDirection,
} from "../natural-wonder-footprints.js";

/**
 * Manual catalog for Civ7 natural wonders, const-backed to avoid runtime reads.
 * Source: feature order is stable per `CIV7_BROWSER_TABLES_V0.featureTypes`.
 */
const { featureTypes } = CIV7_BROWSER_TABLES_V0;
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

const NATURAL_WONDER_CANDIDATES: NaturalWonderCatalogEntry[] = [
  { featureType: featureTypes.FEATURE_BARRIER_REEF, direction: naturalWonderDirection(featureTypes.FEATURE_BARRIER_REEF) },
  { featureType: featureTypes.FEATURE_VALLEY_OF_FLOWERS, direction: naturalWonderDirection(featureTypes.FEATURE_VALLEY_OF_FLOWERS) },
  { featureType: featureTypes.FEATURE_REDWOOD_FOREST, direction: naturalWonderDirection(featureTypes.FEATURE_REDWOOD_FOREST) },
  { featureType: featureTypes.FEATURE_GRAND_CANYON, direction: naturalWonderDirection(featureTypes.FEATURE_GRAND_CANYON) },
  { featureType: featureTypes.FEATURE_GULLFOSS, direction: naturalWonderDirection(featureTypes.FEATURE_GULLFOSS) },
  { featureType: featureTypes.FEATURE_HOERIKWAGGO, direction: naturalWonderDirection(featureTypes.FEATURE_HOERIKWAGGO) },
  { featureType: featureTypes.FEATURE_IGUAZU_FALLS, direction: naturalWonderDirection(featureTypes.FEATURE_IGUAZU_FALLS) },
  { featureType: featureTypes.FEATURE_KILIMANJARO, direction: naturalWonderDirection(featureTypes.FEATURE_KILIMANJARO) },
  { featureType: featureTypes.FEATURE_ZHANGJIAJIE, direction: naturalWonderDirection(featureTypes.FEATURE_ZHANGJIAJIE) },
  { featureType: featureTypes.FEATURE_THERA, direction: naturalWonderDirection(featureTypes.FEATURE_THERA) },
  { featureType: featureTypes.FEATURE_TORRES_DEL_PAINE, direction: naturalWonderDirection(featureTypes.FEATURE_TORRES_DEL_PAINE) },
  { featureType: featureTypes.FEATURE_ULURU, direction: naturalWonderDirection(featureTypes.FEATURE_ULURU) },
];

export const NATURAL_WONDER_CATALOG: NaturalWonderCatalogEntry[] =
  NATURAL_WONDER_CANDIDATES.filter((entry) => isSupportedNaturalWonder(entry.featureType));
