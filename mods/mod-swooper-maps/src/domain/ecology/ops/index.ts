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

import planWetlands from "./features-plan-wetlands/index.js";
import planReefs from "./features-plan-reefs/index.js";
import planIce from "./features-plan-ice/index.js";

import classifyBiomes from "./classify-biomes/index.js";
import classifyPedology from "./pedology-classify/index.js";
import aggregatePedology from "./pedology-aggregate/index.js";
import planResourceBasins from "./resource-plan-basins/index.js";
import scoreResourceBasins from "./resource-score-balance/index.js";
import refineBiomeEdges from "./refine-biome-edges/index.js";

import planAquaticAtollPlacements from "./plan-aquatic-atoll-placements/index.js";
import planAquaticColdReefPlacements from "./plan-aquatic-cold-reef-placements/index.js";
import planAquaticLotusPlacements from "./plan-aquatic-lotus-placements/index.js";
import planAquaticReefPlacements from "./plan-aquatic-reef-placements/index.js";

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

  planAquaticReefPlacements,
  planAquaticColdReefPlacements,
  planAquaticAtollPlacements,
  planAquaticLotusPlacements,

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

  planWetlands,
  planReefs,
  planIce,

  classifyBiomes,
  classifyPedology,
  aggregatePedology,
  planResourceBasins,
  scoreResourceBasins,
  refineBiomeEdges,

  planAquaticReefPlacements,
  planAquaticColdReefPlacements,
  planAquaticAtollPlacements,
  planAquaticLotusPlacements,

  planPlotEffects,

  planWetPlacementMarsh,
  planWetPlacementTundraBog,
  planWetPlacementMangrove,
  planWetPlacementOasis,
  planWetPlacementWateringHole,
};
