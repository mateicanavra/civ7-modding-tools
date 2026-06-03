import type { NaturalWonderCatalogEntry } from "../types.js";
import { CIV7_BROWSER_TABLES_V0 } from "../civ7-tables.gen.js";

/**
 * Manual catalog for Civ7 natural wonders, const-backed to avoid runtime reads.
 * Source: feature order is stable per `CIV7_BROWSER_TABLES_V0.featureTypes`.
 */
const { featureTypes } = CIV7_BROWSER_TABLES_V0;

export const NATURAL_WONDER_CATALOG: NaturalWonderCatalogEntry[] = [
  { featureType: featureTypes.FEATURE_BARRIER_REEF, direction: 0 },
  { featureType: featureTypes.FEATURE_VALLEY_OF_FLOWERS, direction: 0 },
  { featureType: featureTypes.FEATURE_REDWOOD_FOREST, direction: 0 },
  { featureType: featureTypes.FEATURE_GRAND_CANYON, direction: 0 },
  { featureType: featureTypes.FEATURE_GULLFOSS, direction: 0 },
  { featureType: featureTypes.FEATURE_HOERIKWAGGO, direction: 0 },
  { featureType: featureTypes.FEATURE_IGUAZU_FALLS, direction: 0 },
  { featureType: featureTypes.FEATURE_KILIMANJARO, direction: 0 },
  { featureType: featureTypes.FEATURE_ZHANGJIAJIE, direction: 0 },
  { featureType: featureTypes.FEATURE_THERA, direction: 0 },
  { featureType: featureTypes.FEATURE_TORRES_DEL_PAINE, direction: 0 },
  { featureType: featureTypes.FEATURE_ULURU, direction: 0 },
];
