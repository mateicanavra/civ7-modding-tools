import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/old-erosion
 */
export const realismOldErosionConfig: StandardRecipeConfig = {
  // plateCount is a cross-stage knob: it sizes the mesh (mantle) and the plate partition (plates).
  "foundation-mantle": { knobs: { plateCount: 28 } },
  "foundation-lithosphere": { knobs: { plateCount: 28 } },
  "foundation-tectonics": { knobs: { plateActivity: 0.25 } },
  "morphology-coasts": {
    knobs: { seaLevel: "earthlike", coastRuggedness: "smooth", shelfWidth: "normal" },
  },
  "morphology-erosion": { knobs: { erosion: "high" } },
  "morphology-features": { knobs: { volcanism: "low" } },
};
