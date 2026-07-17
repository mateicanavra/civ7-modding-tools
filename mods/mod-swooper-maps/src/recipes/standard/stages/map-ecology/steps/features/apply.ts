import type { FeatureKey } from "@civ7/map-policy";
import type { FeatureIntentKey } from "@mapgen/domain/ecology/model/schemas/index.js";
import type { ExtendedMapContext } from "@swooper/mapgen-core";

const FEATURE_KEY_BY_INTENT: Readonly<Record<FeatureIntentKey, FeatureKey>> = {
  forest: "FEATURE_FOREST",
  rainforest: "FEATURE_RAINFOREST",
  taiga: "FEATURE_TAIGA",
  "savanna-woodland": "FEATURE_SAVANNA_WOODLAND",
  "sagebrush-steppe": "FEATURE_SAGEBRUSH_STEPPE",
  marsh: "FEATURE_MARSH",
  "tundra-bog": "FEATURE_TUNDRA_BOG",
  mangrove: "FEATURE_MANGROVE",
  oasis: "FEATURE_OASIS",
  "watering-hole": "FEATURE_WATERING_HOLE",
  reef: "FEATURE_REEF",
  "cold-reef": "FEATURE_COLD_REEF",
  atoll: "FEATURE_ATOLL",
  lotus: "FEATURE_LOTUS",
  ice: "FEATURE_ICE",
  "desert-floodplain-minor": "FEATURE_DESERT_FLOODPLAIN_MINOR",
  "desert-floodplain-navigable": "FEATURE_DESERT_FLOODPLAIN_NAVIGABLE",
  "grassland-floodplain-minor": "FEATURE_GRASSLAND_FLOODPLAIN_MINOR",
  "grassland-floodplain-navigable": "FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE",
  "plains-floodplain-minor": "FEATURE_PLAINS_FLOODPLAIN_MINOR",
  "plains-floodplain-navigable": "FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE",
  "tropical-floodplain-minor": "FEATURE_TROPICAL_FLOODPLAIN_MINOR",
  "tropical-floodplain-navigable": "FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE",
  "tundra-floodplain-minor": "FEATURE_TUNDRA_FLOODPLAIN_MINOR",
  "tundra-floodplain-navigable": "FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE",
};

/** Resolves a closed Ecology intent to its official Civ7 feature key and rejects unknown intent. */
export function resolveFeatureKeyForIntent(intent: string): FeatureKey {
  const feature = FEATURE_KEY_BY_INTENT[intent as FeatureIntentKey];
  if (!feature) {
    throw new Error(`FeaturesStep: Unknown feature intent "${intent}".`);
  }
  return feature;
}

/**
 * Copies engine feature types into the field buffer after application.
 */
export function reifyFeatureField(context: ExtendedMapContext): void {
  const featureTypeField = context.fields?.featureType;
  if (!featureTypeField) {
    throw new Error("FeaturesStep: Missing field:featureType buffer for reification.");
  }

  const { width, height } = context.dimensions;
  const { adapter } = context;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      featureTypeField[rowOffset + x] = adapter.getFeatureType(x, y) | 0;
    }
  }
}
