import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/old-erosion
 */
export const realismOldErosionConfig: StandardRecipeConfig = {
  foundation: {
    knobs: { plateCount: 28, plateActivity: 0.25 },
  },
  "morphology-coasts": { knobs: { seaLevel: "earthlike", coastRuggedness: "smooth", shelfWidth: "normal" } },
  "morphology-erosion": { knobs: { erosion: "high" } },
  "morphology-features": { knobs: { volcanism: "low" } },
};
