import biophysicalGaussian from "./biophysical-gaussian/index.js";

/** Classifies admitted climate and soil fields into biome indices and vegetation density, then smooths only land-biome edges. Implementations available to the recipe's semantic strategy selection. */
export default [biophysicalGaussian] as const;
