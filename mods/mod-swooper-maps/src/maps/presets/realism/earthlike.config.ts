import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/earthlike
 *
 * Intended posture:
 * - Defaults-first realism baseline with light semantic tuning via knobs.
 * - Authors can further tune using stage knobs without editing step-level config trees.
 */
export const realismEarthlikeConfig: StandardRecipeConfig = {
  foundation: { knobs: { plateCount: "normal", plateActivity: "normal" } },
  "morphology-coasts": { knobs: { seaLevel: "earthlike", coastRuggedness: "normal", shelfWidth: "normal" } },
  "morphology-erosion": { knobs: { erosion: "normal" } },
  "morphology-features": { knobs: { volcanism: "normal" } },
  "hydrology-climate-baseline": {
    knobs: { dryness: "dry", temperature: "temperate", seasonality: "normal", oceanCoupling: "earthlike" },
  },
  "hydrology-hydrography": { knobs: { riverDensity: "normal" } },
  "hydrology-climate-refine": { knobs: { dryness: "dry", temperature: "temperate", cryosphere: "on" } },
  "map-morphology": { knobs: { orogeny: "normal" } },
};
