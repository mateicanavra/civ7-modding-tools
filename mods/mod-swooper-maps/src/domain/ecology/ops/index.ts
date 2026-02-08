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

import planAquaticAtollPlacements from "./plan-aquatic-atoll-placements/index.js";
import planAquaticColdReefPlacements from "./plan-aquatic-cold-reef-placements/index.js";
import planAquaticLotusPlacements from "./plan-aquatic-lotus-placements/index.js";
import planAquaticReefPlacements from "./plan-aquatic-reef-placements/index.js";

import planIceFeaturePlacements from "./plan-ice-feature-placements/index.js";
import planPlotEffects from "./plan-plot-effects/index.js";
import planReefEmbellishmentsReef from "./plan-reef-embellishments-reef/index.js";

import planVegetatedPlacementForest from "./plan-vegetated-placement-forest/index.js";
import planVegetatedPlacementRainforest from "./plan-vegetated-placement-rainforest/index.js";
import planVegetatedPlacementSagebrushSteppe from "./plan-vegetated-placement-sagebrush-steppe/index.js";
import planVegetatedPlacementSavannaWoodland from "./plan-vegetated-placement-savanna-woodland/index.js";
import planVegetatedPlacementTaiga from "./plan-vegetated-placement-taiga/index.js";

import planVegetationEmbellishmentsForestDensity from "./plan-vegetation-embellishments-forest-density/index.js";
import planVegetationEmbellishmentsRainforestDensity from "./plan-vegetation-embellishments-rainforest-density/index.js";
import planVegetationEmbellishmentsTaigaDensity from "./plan-vegetation-embellishments-taiga-density/index.js";
import planVegetationEmbellishmentsVolcanicForest from "./plan-vegetation-embellishments-volcanic-forest/index.js";
import planVegetationEmbellishmentsVolcanicTaiga from "./plan-vegetation-embellishments-volcanic-taiga/index.js";

import planWetFeaturePlacements from "./plan-wet-feature-placements/index.js";
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

  planAquaticReefPlacements,
  planAquaticColdReefPlacements,
  planAquaticAtollPlacements,
  planAquaticLotusPlacements,

  planIceFeaturePlacements,
  planPlotEffects,
  planReefEmbellishmentsReef,

  planVegetatedPlacementForest,
  planVegetatedPlacementRainforest,
  planVegetatedPlacementTaiga,
  planVegetatedPlacementSavannaWoodland,
  planVegetatedPlacementSagebrushSteppe,

  planVegetationEmbellishmentsVolcanicForest,
  planVegetationEmbellishmentsVolcanicTaiga,
  planVegetationEmbellishmentsRainforestDensity,
  planVegetationEmbellishmentsForestDensity,
  planVegetationEmbellishmentsTaigaDensity,

  planWetFeaturePlacements,
  planWetPlacementMarsh,
  planWetPlacementTundraBog,
  planWetPlacementMangrove,
  planWetPlacementOasis,
  planWetPlacementWateringHole,

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

  planAquaticReefPlacements,
  planAquaticColdReefPlacements,
  planAquaticAtollPlacements,
  planAquaticLotusPlacements,

  planIceFeaturePlacements,
  planPlotEffects,
  planReefEmbellishmentsReef,

  planVegetatedPlacementForest,
  planVegetatedPlacementRainforest,
  planVegetatedPlacementTaiga,
  planVegetatedPlacementSavannaWoodland,
  planVegetatedPlacementSagebrushSteppe,

  planVegetationEmbellishmentsVolcanicForest,
  planVegetationEmbellishmentsVolcanicTaiga,
  planVegetationEmbellishmentsRainforestDensity,
  planVegetationEmbellishmentsForestDensity,
  planVegetationEmbellishmentsTaigaDensity,

  planWetFeaturePlacements,
  planWetPlacementMarsh,
  planWetPlacementTundraBog,
  planWetPlacementMangrove,
  planWetPlacementOasis,
  planWetPlacementWateringHole,
};

