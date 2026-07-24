import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import computeFeatureSubstrate from "./compute-feature-substrate/index.js";
import computeVegetationSubstrate from "./compute-vegetation-substrate/index.js";
import applyFeatures from "./features-apply/index.js";
import planFloodplains from "./features-plan-floodplains/index.js";
import planIce from "./features-plan-ice/index.js";
import planReefs from "./features-plan-reefs/index.js";
import planVegetation from "./features-plan-vegetation/index.js";
import planWetlands from "./features-plan-wetlands/index.js";
import scoreIce from "./ice-score-ice/index.js";
import scoreReefAtoll from "./reef-score-atoll/index.js";
import scoreColdReef from "./reef-score-cold-reef/index.js";
import scoreReefLotus from "./reef-score-lotus/index.js";
import scoreReef from "./reef-score-reef/index.js";
import scoreVegetationForest from "./vegetation-score-forest/index.js";
import scoreVegetationRainforest from "./vegetation-score-rainforest/index.js";
import scoreVegetationSagebrushSteppe from "./vegetation-score-sagebrush-steppe/index.js";
import scoreVegetationSavannaWoodland from "./vegetation-score-savanna-woodland/index.js";
import scoreVegetationTaiga from "./vegetation-score-taiga/index.js";
import scoreWetMangrove from "./wet-score-mangrove/index.js";
import scoreWetMarsh from "./wet-score-marsh/index.js";
import scoreWetOasis from "./wet-score-oasis/index.js";
import scoreWetTundraBog from "./wet-score-tundra-bog/index.js";
import scoreWetWateringHole from "./wet-score-watering-hole/index.js";

type Contracts = typeof import("./contract.js").default;

/** Feature implementations keyed exactly like the branch contract registry. */
const implementations = {
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
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
