import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeFeatureSubstrateContract from "./ops/compute-feature-substrate/contract.js";
import ComputeVegetationSubstrateContract from "./ops/compute-vegetation-substrate/contract.js";
import FeaturesApplyContract from "./ops/features-apply/contract.js";
import PlanFloodplainsContract from "./ops/features-plan-floodplains/contract.js";
import PlanIceContract from "./ops/features-plan-ice/contract.js";
import PlanReefsContract from "./ops/features-plan-reefs/contract.js";
import PlanVegetationContract from "./ops/features-plan-vegetation/contract.js";
import PlanWetlandsContract from "./ops/features-plan-wetlands/contract.js";
import ScoreFloodplainsContract from "./ops/floodplain-score/contract.js";
import ScoreIceContract from "./ops/ice-score-ice/contract.js";
import ScoreAtollContract from "./ops/reef-score-atoll/contract.js";
import ScoreColdReefContract from "./ops/reef-score-cold-reef/contract.js";
import ScoreLotusContract from "./ops/reef-score-lotus/contract.js";
import ScoreReefContract from "./ops/reef-score-reef/contract.js";
import ScoreVegetationForestContract from "./ops/vegetation-score-forest/contract.js";
import ScoreVegetationRainforestContract from "./ops/vegetation-score-rainforest/contract.js";
import ScoreVegetationSagebrushSteppeContract from "./ops/vegetation-score-sagebrush-steppe/contract.js";
import ScoreVegetationSavannaWoodlandContract from "./ops/vegetation-score-savanna-woodland/contract.js";
import ScoreVegetationTaigaContract from "./ops/vegetation-score-taiga/contract.js";
import ScoreWetMangroveContract from "./ops/wet-score-mangrove/contract.js";
import ScoreWetMarshContract from "./ops/wet-score-marsh/contract.js";
import ScoreWetOasisContract from "./ops/wet-score-oasis/contract.js";
import ScoreWetTundraBogContract from "./ops/wet-score-tundra-bog/contract.js";
import ScoreWetWateringHoleContract from "./ops/wet-score-watering-hole/contract.js";

/** Feature branch contract for substrate derivation, scoring, intent planning, and application. */
const features = defineDomainSubdomain({
  id: "features",
  ops: {
    computeFeatureSubstrate: ComputeFeatureSubstrateContract,
    computeVegetationSubstrate: ComputeVegetationSubstrateContract,
    scoreVegetationForest: ScoreVegetationForestContract,
    scoreVegetationRainforest: ScoreVegetationRainforestContract,
    scoreVegetationTaiga: ScoreVegetationTaigaContract,
    scoreVegetationSavannaWoodland: ScoreVegetationSavannaWoodlandContract,
    scoreVegetationSagebrushSteppe: ScoreVegetationSagebrushSteppeContract,
    scoreWetMarsh: ScoreWetMarshContract,
    scoreWetTundraBog: ScoreWetTundraBogContract,
    scoreWetMangrove: ScoreWetMangroveContract,
    scoreWetOasis: ScoreWetOasisContract,
    scoreWetWateringHole: ScoreWetWateringHoleContract,
    scoreReef: ScoreReefContract,
    scoreColdReef: ScoreColdReefContract,
    scoreReefAtoll: ScoreAtollContract,
    scoreReefLotus: ScoreLotusContract,
    scoreIce: ScoreIceContract,
    scoreFloodplains: ScoreFloodplainsContract,
    planFloodplains: PlanFloodplainsContract,
    planWetlands: PlanWetlandsContract,
    planReefs: PlanReefsContract,
    planIce: PlanIceContract,
    planVegetation: PlanVegetationContract,
    applyFeatures: FeaturesApplyContract,
  },
});

export default features;
