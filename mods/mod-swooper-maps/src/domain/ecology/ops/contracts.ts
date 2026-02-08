import AggregatePedologyContract from "./pedology-aggregate/contract.js";
import BiomeClassificationContract from "./classify-biomes/contract.js";
import ComputeFeatureSubstrateContract from "./compute-feature-substrate/contract.js";
import FeaturesApplyContract from "./features-apply/contract.js";
import PedologyClassifyContract from "./pedology-classify/contract.js";
import PlanAquaticFeaturePlacementsContract from "./plan-aquatic-feature-placements/contract.js";
import PlanIceContract from "./features-plan-ice/contract.js";
import PlanIceFeaturePlacementsContract from "./plan-ice-feature-placements/contract.js";
import PlanPlotEffectsContract from "./plan-plot-effects/contract.js";
import PlanReefEmbellishmentsContract from "./plan-reef-embellishments/contract.js";
import PlanReefsContract from "./features-plan-reefs/contract.js";
import PlanVegetatedFeaturePlacementsContract from "./plan-vegetated-feature-placements/contract.js";
import PlanVegetationForestContract from "./features-plan-vegetation-forest/contract.js";
import PlanVegetationRainforestContract from "./features-plan-vegetation-rainforest/contract.js";
import PlanVegetationSagebrushSteppeContract from "./features-plan-vegetation-sagebrush-steppe/contract.js";
import PlanVegetationSavannaWoodlandContract from "./features-plan-vegetation-savanna-woodland/contract.js";
import PlanVegetationTaigaContract from "./features-plan-vegetation-taiga/contract.js";
import PlanVegetationEmbellishmentsContract from "./plan-vegetation-embellishments/contract.js";
import PlanWetFeaturePlacementsContract from "./plan-wet-feature-placements/contract.js";
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
  planAquaticFeaturePlacements: PlanAquaticFeaturePlacementsContract,
  planIceFeaturePlacements: PlanIceFeaturePlacementsContract,
  planPlotEffects: PlanPlotEffectsContract,
  planReefEmbellishments: PlanReefEmbellishmentsContract,
  planVegetatedFeaturePlacements: PlanVegetatedFeaturePlacementsContract,
  planVegetationEmbellishments: PlanVegetationEmbellishmentsContract,
  planWetFeaturePlacements: PlanWetFeaturePlacementsContract,
  planVegetationForest: PlanVegetationForestContract,
  planVegetationRainforest: PlanVegetationRainforestContract,
  planVegetationTaiga: PlanVegetationTaigaContract,
  planVegetationSavannaWoodland: PlanVegetationSavannaWoodlandContract,
  planVegetationSagebrushSteppe: PlanVegetationSagebrushSteppeContract,
  planWetlands: PlanWetlandsContract,
  planReefs: PlanReefsContract,
  planIce: PlanIceContract,
  applyFeatures: FeaturesApplyContract,
} as const;

export default contracts;

export {
  AggregatePedologyContract,
  BiomeClassificationContract,
  ComputeFeatureSubstrateContract,
  FeaturesApplyContract,
  PedologyClassifyContract,
  PlanAquaticFeaturePlacementsContract,
  PlanIceContract,
  PlanIceFeaturePlacementsContract,
  PlanPlotEffectsContract,
  PlanReefEmbellishmentsContract,
  PlanReefsContract,
  PlanVegetatedFeaturePlacementsContract,
  PlanVegetationForestContract,
  PlanVegetationRainforestContract,
  PlanVegetationSagebrushSteppeContract,
  PlanVegetationSavannaWoodlandContract,
  PlanVegetationTaigaContract,
  PlanVegetationEmbellishmentsContract,
  PlanWetFeaturePlacementsContract,
  PlanWetlandsContract,
  RefineBiomeEdgesContract,
  ResourcePlanBasinsContract,
  ResourceScoreBalanceContract,
};

export type { PlanWetFeaturePlacementsTypes } from "./plan-wet-feature-placements/types.js";
