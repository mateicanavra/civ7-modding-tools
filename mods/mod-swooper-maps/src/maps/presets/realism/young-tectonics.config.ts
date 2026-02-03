import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/young-tectonics
 */
export const realismYoungTectonicsConfig: StandardRecipeConfig = {
  foundation: { knobs: { plateCount: "normal", plateActivity: "high" } },
  "morphology-coasts": { knobs: { seaLevel: "earthlike", coastRuggedness: "rugged" } },
  "morphology-erosion": { knobs: { erosion: "high" } },
  "morphology-features": { knobs: { volcanism: "high" } },
};
