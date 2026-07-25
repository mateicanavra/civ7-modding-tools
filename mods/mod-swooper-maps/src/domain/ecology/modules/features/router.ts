import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeFeatureSubstrate from "./ops/compute-feature-substrate/index.js";
import computeVegetationSubstrate from "./ops/compute-vegetation-substrate/index.js";
import applyFeatures from "./ops/features-apply/index.js";
import planFloodplains from "./ops/features-plan-floodplains/index.js";
import planIce from "./ops/features-plan-ice/index.js";
import planReefs from "./ops/features-plan-reefs/index.js";
import planVegetation from "./ops/features-plan-vegetation/index.js";
import planWetlands from "./ops/features-plan-wetlands/index.js";
import scoreIce from "./ops/ice-score-ice/index.js";
import scoreReefAtoll from "./ops/reef-score-atoll/index.js";
import scoreColdReef from "./ops/reef-score-cold-reef/index.js";
import scoreReefLotus from "./ops/reef-score-lotus/index.js";
import scoreReef from "./ops/reef-score-reef/index.js";
import scoreVegetationForest from "./ops/vegetation-score-forest/index.js";
import scoreVegetationRainforest from "./ops/vegetation-score-rainforest/index.js";
import scoreVegetationSagebrushSteppe from "./ops/vegetation-score-sagebrush-steppe/index.js";
import scoreVegetationSavannaWoodland from "./ops/vegetation-score-savanna-woodland/index.js";
import scoreVegetationTaiga from "./ops/vegetation-score-taiga/index.js";
import scoreWetMangrove from "./ops/wet-score-mangrove/index.js";
import scoreWetMarsh from "./ops/wet-score-marsh/index.js";
import scoreWetOasis from "./ops/wet-score-oasis/index.js";
import scoreWetTundraBog from "./ops/wet-score-tundra-bog/index.js";
import scoreWetWateringHole from "./ops/wet-score-watering-hole/index.js";

/** Executable Ecology feature branch. */
const features = createDomainSubdomainRouter(contract, {
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
  planFloodplains,
  planWetlands,
  planReefs,
  planIce,
  planVegetation,
  applyFeatures,
});

export default features;
