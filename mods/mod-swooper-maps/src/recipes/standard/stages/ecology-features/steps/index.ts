import planFloodplains from "./plan-floodplains/index.js";
import planIce from "./plan-ice/index.js";
import planPlotEffects from "./plan-plot-effects/index.js";
import planReefs from "./plan-reefs/index.js";
import planVegetation from "./plan-vegetation/index.js";
import planWetlands from "./plan-wetlands/index.js";
import scoreLayers from "./score-layers/index.js";

/**
 * Ordered feature-planning pipeline.
 *
 * Occupancy flows from base scoring through each feature family, so the order
 * is a behavioral contract rather than a collection of independent stages.
 */
export const steps = {
  scoreLayers,
  planFloodplains,
  planIce,
  planReefs,
  planWetlands,
  planVegetation,
  planPlotEffects,
};
