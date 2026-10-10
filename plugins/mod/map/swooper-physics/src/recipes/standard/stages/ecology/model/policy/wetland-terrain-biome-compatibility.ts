import { getEngineFeatureLegality } from "@civ7/map-policy";
import { biomeSymbolFromIndex } from "../../../../../../domain/ecology/index.js";
import {
  WETLAND_FEATURE_INTENT_KEYS,
  type WetlandTerrainBiomeCompatibilityMasks,
} from "../../../../../../domain/ecology/modules/features/model/atoms/index.js";
import { SWOOPER_LAND_BIOME_PROJECTION } from "./biome-projection.js";
import { resolveFeatureKeyForIntent } from "./feature-projection.js";

type WetlandCompatibilityInput = Readonly<{
  width: number;
  height: number;
  flatLandMask: ArrayLike<number>;
  biomeIndex: ArrayLike<number>;
}>;

/**
 * Derives transient official terrain/biome compatibility for planned flat ground.
 * This is not a native feasibility prediction: canHaveFeature remains projection's final guard.
 */
export function deriveWetlandTerrainBiomeCompatibilityMasks(
  input: WetlandCompatibilityInput
): WetlandTerrainBiomeCompatibilityMasks {
  const size = input.width * input.height;
  const masks: WetlandTerrainBiomeCompatibilityMasks = {
    marsh: new Uint8Array(size),
    "tundra-bog": new Uint8Array(size),
    mangrove: new Uint8Array(size),
    oasis: new Uint8Array(size),
    "watering-hole": new Uint8Array(size),
  };

  for (const family of WETLAND_FEATURE_INTENT_KEYS) {
    const feature = resolveFeatureKeyForIntent(family);
    const legality = getEngineFeatureLegality(feature);
    if (!legality) {
      throw new Error(`Wetland compatibility: missing official terrain/biome policy for "${feature}".`);
    }
    if (!legality.terrains.includes("TERRAIN_FLAT")) continue;

    for (let i = 0; i < size; i++) {
      if (input.flatLandMask[i] !== 1 || input.biomeIndex[i] === 255) continue;
      const biome = SWOOPER_LAND_BIOME_PROJECTION[biomeSymbolFromIndex(input.biomeIndex[i]!)];
      if (legality.biomes.includes(biome)) masks[family][i] = 1;
    }
  }

  return masks;
}
