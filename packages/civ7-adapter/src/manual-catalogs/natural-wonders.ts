import type { NaturalWonderCatalogEntry } from "../types.js";

/**
 * Manual catalog for Civ7 natural wonders, const-backed to avoid runtime reads.
 * Source: `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`
 * (feature order is stable per `CIV7_BROWSER_TABLES_V0.featureTypes`).
 */
export const NATURAL_WONDER_CATALOG: NaturalWonderCatalogEntry[] = [
  { featureType: 27, direction: 0 }, // FEATURE_BARRIER_REEF
  { featureType: 26, direction: 0 }, // FEATURE_VALLEY_OF_FLOWERS
  { featureType: 28, direction: 0 }, // FEATURE_REDWOOD_FOREST
  { featureType: 29, direction: 0 }, // FEATURE_GRAND_CANYON
  { featureType: 30, direction: 0 }, // FEATURE_GULLFOSS
  { featureType: 31, direction: 0 }, // FEATURE_HOERIKWAGGO
  { featureType: 32, direction: 0 }, // FEATURE_IGUAZU_FALLS
  { featureType: 33, direction: 0 }, // FEATURE_KILIMANJARO
  { featureType: 34, direction: 0 }, // FEATURE_ZHANGJIAJIE
  { featureType: 35, direction: 0 }, // FEATURE_THERA
  { featureType: 36, direction: 0 }, // FEATURE_TORRES_DEL_PAINE
  { featureType: 37, direction: 0 }, // FEATURE_ULURU
];
