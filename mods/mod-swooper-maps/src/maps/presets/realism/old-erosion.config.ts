import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/old-erosion
 */
export const realismOldErosionConfig: StandardRecipeConfig = {
  foundation: { knobs: { plateCount: "normal", plateActivity: "low" } },
  "morphology-coasts": { knobs: { seaLevel: "earthlike", coastRuggedness: "smooth" } },
  "morphology-erosion": { knobs: { erosion: "high" } },
  "morphology-features": { knobs: { volcanism: "low" } },
};
