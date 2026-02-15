import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import applyFeatures from "./features-apply/index.js";
import computeFeatureSubstrate from "./compute-feature-substrate/index.js";
import computeVegetationSubstrate from "./compute-vegetation-substrate/index.js";
import scoreVegetationForest from "./vegetation-score-forest/index.js";
import scoreVegetationRainforest from "./vegetation-score-rainforest/index.js";
import scoreVegetationTaiga from "./vegetation-score-taiga/index.js";
import scoreVegetationSavannaWoodland from "./vegetation-score-savanna-woodland/index.js";
import scoreVegetationSagebrushSteppe from "./vegetation-score-sagebrush-steppe/index.js";
import scoreWetMangrove from "./wet-score-mangrove/index.js";
import scoreWetMarsh from "./wet-score-marsh/index.js";
import scoreWetOasis from "./wet-score-oasis/index.js";
import scoreWetTundraBog from "./wet-score-tundra-bog/index.js";
import scoreWetWateringHole from "./wet-score-watering-hole/index.js";
import scoreReef from "./reef-score-reef/index.js";
import scoreColdReef from "./reef-score-cold-reef/index.js";
import scoreReefAtoll from "./reef-score-atoll/index.js";
import scoreReefLotus from "./reef-score-lotus/index.js";
import scoreIce from "./ice-score-ice/index.js";

import planWetlands from "./features-plan-wetlands/index.js";
import planReefs from "./features-plan-reefs/index.js";
import planIce from "./features-plan-ice/index.js";

import classifyBiomes from "./classify-biomes/index.js";
import classifyPedology from "./pedology-classify/index.js";
import aggregatePedology from "./pedology-aggregate/index.js";
import planResourceBasins from "./resource-plan-basins/index.js";
import scoreResourceBasins from "./resource-score-balance/index.js";
import refineBiomeEdges from "./refine-biome-edges/index.js";

import planPlotEffects from "./plan-plot-effects/index.js";

import planWetPlacementMangrove from "./plan-wet-placement-mangrove/index.js";
import planWetPlacementMarsh from "./plan-wet-placement-marsh/index.js";
import planWetPlacementOasis from "./plan-wet-placement-oasis/index.js";
import planWetPlacementTundraBog from "./plan-wet-placement-tundra-bog/index.js";
import planWetPlacementWateringHole from "./plan-wet-placement-watering-hole/index.js";

const implementations = {
  classifyBiomes,
  classifyPedology,
  aggregatePedology,
  planResourceBasins,
  scoreResourceBasins,
  refineBiomeEdges,

  computeFeatureSubstrate,
  computeVegetationSubstrate,
  scoreVegetationForest,
  scoreVegetationRainforest,
  scoreVegetationTaiga,
  scoreVegetationSavannaWoodland,
  scoreVegetationSagebrushSteppe,
  scoreWetMarsh,
  scoreWetTundraBog,
  scoreWetMangrove,
  scoreWetOasis,
  scoreWetWateringHole,
  scoreReef,
  scoreColdReef,
  scoreReefAtoll,
  scoreReefLotus,
  scoreIce,

  planPlotEffects,

  planWetPlacementMarsh,
  planWetPlacementTundraBog,
  planWetPlacementMangrove,
  planWetPlacementOasis,
  planWetPlacementWateringHole,

  planWetlands,
  planReefs,
  planIce,

  applyFeatures,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export {
  applyFeatures,
  computeFeatureSubstrate,
  computeVegetationSubstrate,
  scoreVegetationForest,
  scoreVegetationRainforest,
  scoreVegetationTaiga,
  scoreVegetationSavannaWoodland,
  scoreVegetationSagebrushSteppe,
  scoreWetMangrove,
  scoreWetMarsh,
  scoreWetOasis,
  scoreWetTundraBog,
  scoreWetWateringHole,
  scoreReef,
  scoreColdReef,
  scoreReefAtoll,
  scoreReefLotus,
  scoreIce,

  planWetlands,
  planReefs,
  planIce,

  classifyBiomes,
  classifyPedology,
  aggregatePedology,
  planResourceBasins,
  scoreResourceBasins,
  refineBiomeEdges,

  planPlotEffects,

  planWetPlacementMarsh,
  planWetPlacementTundraBog,
  planWetPlacementMangrove,
  planWetPlacementOasis,
  planWetPlacementWateringHole,
};
