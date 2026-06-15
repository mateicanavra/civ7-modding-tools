import featuresApply from "./features-apply/index.js";
import plotEffects from "./plot-effects/index.js";
import plotBiomes from "./plotBiomes.js";

/**
 * Projection steps stay separate because each one touches a different Civ7
 * runtime surface: biome buffers, feature placement, and plot-effect stamping.
 */
export const steps = { plotBiomes, featuresApply, plotEffects };
