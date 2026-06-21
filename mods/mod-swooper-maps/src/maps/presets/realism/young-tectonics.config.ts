import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";

/**
 * Preset: realism/young-tectonics
 */
export const realismYoungTectonicsConfig: StandardRecipeConfig = {
  // plateCount is a cross-stage knob: it sizes the mesh (mantle) and the plate partition (plates).
  "foundation-mantle": { knobs: { plateCount: 28 } },
  "foundation-lithosphere": { knobs: { plateCount: 28 } },
  "foundation-tectonics": { knobs: { plateActivity: 0.75 } },
  "morphology-coasts": {
    knobs: { seaLevel: "earthlike", coastRuggedness: "rugged", shelfWidth: "normal" },
  },
  "morphology-erosion": { knobs: { erosion: "high" } },
  "morphology-features": { knobs: { volcanism: "high" } },
};
