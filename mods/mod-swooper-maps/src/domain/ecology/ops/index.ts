import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import applyFeatures from "./features-apply/index.js";
import computeFeatureSubstrate from "./compute-feature-substrate/index.js";
import planVegetationForest from "./features-plan-vegetation-forest/index.js";
import planVegetationRainforest from "./features-plan-vegetation-rainforest/index.js";
import planVegetationSagebrushSteppe from "./features-plan-vegetation-sagebrush-steppe/index.js";
import planVegetationSavannaWoodland from "./features-plan-vegetation-savanna-woodland/index.js";
import planVegetationTaiga from "./features-plan-vegetation-taiga/index.js";
import planWetlands from "./features-plan-wetlands/index.js";
import planReefs from "./features-plan-reefs/index.js";
import planIce from "./features-plan-ice/index.js";
import classifyBiomes from "./classify-biomes/index.js";
import classifyPedology from "./pedology-classify/index.js";
import aggregatePedology from "./pedology-aggregate/index.js";
import planResourceBasins from "./resource-plan-basins/index.js";
import scoreResourceBasins from "./resource-score-balance/index.js";
import refineBiomeEdges from "./refine-biome-edges/index.js";
import planAquaticFeaturePlacements from "./plan-aquatic-feature-placements/index.js";
import planIceFeaturePlacements from "./plan-ice-feature-placements/index.js";
import planPlotEffects from "./plan-plot-effects/index.js";
import planReefEmbellishments from "./plan-reef-embellishments/index.js";
import planVegetatedFeaturePlacements from "./plan-vegetated-feature-placements/index.js";
import planVegetationEmbellishments from "./plan-vegetation-embellishments/index.js";
import planWetFeaturePlacements from "./plan-wet-feature-placements/index.js";

const implementations = {
  classifyBiomes,
  classifyPedology,
  aggregatePedology,
  planResourceBasins,
  scoreResourceBasins,
  refineBiomeEdges,
  computeFeatureSubstrate,
  planAquaticFeaturePlacements,
  planIceFeaturePlacements,
  planPlotEffects,
  planReefEmbellishments,
  planVegetatedFeaturePlacements,
  planVegetationEmbellishments,
  planWetFeaturePlacements,
  planVegetationForest,
  planVegetationRainforest,
  planVegetationTaiga,
  planVegetationSavannaWoodland,
  planVegetationSagebrushSteppe,
  planWetlands,
  planReefs,
  planIce,
  applyFeatures,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export {
  applyFeatures,
  computeFeatureSubstrate,
  planVegetationForest,
  planVegetationRainforest,
  planVegetationTaiga,
  planVegetationSavannaWoodland,
  planVegetationSagebrushSteppe,
  planWetlands,
  planReefs,
  planIce,
  classifyBiomes,
  classifyPedology,
  aggregatePedology,
  planResourceBasins,
  scoreResourceBasins,
  refineBiomeEdges,
  planAquaticFeaturePlacements,
  planIceFeaturePlacements,
  planPlotEffects,
  planReefEmbellishments,
  planVegetatedFeaturePlacements,
  planVegetationEmbellishments,
  planWetFeaturePlacements,
};
