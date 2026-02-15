import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/young-tectonics
 */
export const realismYoungTectonicsConfig: StandardRecipeConfig = {
  foundation: {
    version: 1,
    profiles: {
      resolutionProfile: "balanced",
    },
    knobs: { plateCount: 28, plateActivity: 0.75 },
  },
  "morphology-coasts": { knobs: { seaLevel: "earthlike", coastRuggedness: "rugged", shelfWidth: "normal" } },
  "morphology-erosion": { knobs: { erosion: "high" } },
  "morphology-features": { knobs: { volcanism: "high" } },
};
