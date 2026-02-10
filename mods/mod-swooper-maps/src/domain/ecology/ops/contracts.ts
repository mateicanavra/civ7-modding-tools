import AggregatePedologyContract from "./pedology-aggregate/contract.js";
import BiomeClassificationContract from "./classify-biomes/contract.js";
import ComputeFeatureSubstrateContract from "./compute-feature-substrate/contract.js";
import ComputeVegetationSubstrateContract from "./compute-vegetation-substrate/contract.js";
import ScoreVegetationForestContract from "./vegetation-score-forest/contract.js";
import ScoreVegetationRainforestContract from "./vegetation-score-rainforest/contract.js";
import ScoreVegetationTaigaContract from "./vegetation-score-taiga/contract.js";
import ScoreVegetationSavannaWoodlandContract from "./vegetation-score-savanna-woodland/contract.js";
import ScoreVegetationSagebrushSteppeContract from "./vegetation-score-sagebrush-steppe/contract.js";
import ScoreWetMangroveContract from "./wet-score-mangrove/contract.js";
import ScoreWetMarshContract from "./wet-score-marsh/contract.js";
import ScoreWetOasisContract from "./wet-score-oasis/contract.js";
import ScoreWetTundraBogContract from "./wet-score-tundra-bog/contract.js";
import ScoreWetWateringHoleContract from "./wet-score-watering-hole/contract.js";
import ScoreAtollContract from "./reef-score-atoll/contract.js";
import ScoreColdReefContract from "./reef-score-cold-reef/contract.js";
import ScoreLotusContract from "./reef-score-lotus/contract.js";
import ScoreReefContract from "./reef-score-reef/contract.js";
import ScoreIceContract from "./ice-score-ice/contract.js";
import PlotEffectsScoreSnowContract from "./plot-effects-score-snow/contract.js";
import PlotEffectsScoreSandContract from "./plot-effects-score-sand/contract.js";
import PlotEffectsScoreBurnedContract from "./plot-effects-score-burned/contract.js";
import FeaturesApplyContract from "./features-apply/contract.js";
import PedologyClassifyContract from "./pedology-classify/contract.js";

import PlanIceContract from "./features-plan-ice/contract.js";
import PlanPlotEffectsContract from "./plan-plot-effects/contract.js";
import PlanReefsContract from "./features-plan-reefs/contract.js";
import PlanVegetationContract from "./features-plan-vegetation/contract.js";

import PlanWetlandsContract from "./features-plan-wetlands/contract.js";
import RefineBiomeEdgesContract from "./refine-biome-edges/contract.js";
import ResourcePlanBasinsContract from "./resource-plan-basins/contract.js";
import ResourceScoreBalanceContract from "./resource-score-balance/contract.js";

export const contracts = {
  classifyBiomes: BiomeClassificationContract,
  classifyPedology: PedologyClassifyContract,
  aggregatePedology: AggregatePedologyContract,
  planResourceBasins: ResourcePlanBasinsContract,
  scoreResourceBasins: ResourceScoreBalanceContract,
  refineBiomeEdges: RefineBiomeEdgesContract,

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

  scorePlotEffectsSnow: PlotEffectsScoreSnowContract,
  scorePlotEffectsSand: PlotEffectsScoreSandContract,
  scorePlotEffectsBurned: PlotEffectsScoreBurnedContract,
  planPlotEffects: PlanPlotEffectsContract,

  planWetlands: PlanWetlandsContract,
  planReefs: PlanReefsContract,
  planIce: PlanIceContract,
  planVegetation: PlanVegetationContract,

  applyFeatures: FeaturesApplyContract,
} as const;

export default contracts;

export {
  AggregatePedologyContract,
  BiomeClassificationContract,
  ComputeFeatureSubstrateContract,
  ComputeVegetationSubstrateContract,
  ScoreVegetationForestContract,
  ScoreVegetationRainforestContract,
  ScoreVegetationTaigaContract,
  ScoreVegetationSavannaWoodlandContract,
  ScoreVegetationSagebrushSteppeContract,
  ScoreWetMangroveContract,
  ScoreWetMarshContract,
  ScoreWetOasisContract,
  ScoreWetTundraBogContract,
  ScoreWetWateringHoleContract,
  ScoreAtollContract,
  ScoreColdReefContract,
  ScoreLotusContract,
  ScoreReefContract,
  ScoreIceContract,
  PlotEffectsScoreSnowContract,
  PlotEffectsScoreSandContract,
  PlotEffectsScoreBurnedContract,
  FeaturesApplyContract,
  PedologyClassifyContract,

  PlanIceContract,
  PlanPlotEffectsContract,
  PlanReefsContract,
  PlanVegetationContract,

  PlanWetlandsContract,
  RefineBiomeEdgesContract,
  ResourcePlanBasinsContract,
  ResourceScoreBalanceContract,
};
