import AggregatePedologyContract from "./pedology-aggregate/contract.js";
import BiomeClassificationContract from "./classify-biomes/contract.js";
import ComputeFeatureSubstrateContract from "./compute-feature-substrate/contract.js";
import ComputeVegetationSubstrateContract from "./compute-vegetation-substrate/contract.js";
import ScoreVegetationForestContract from "./vegetation-score-forest/contract.js";
import ScoreVegetationRainforestContract from "./vegetation-score-rainforest/contract.js";
import ScoreVegetationTaigaContract from "./vegetation-score-taiga/contract.js";
import ScoreVegetationSavannaWoodlandContract from "./vegetation-score-savanna-woodland/contract.js";
import ScoreVegetationSagebrushSteppeContract from "./vegetation-score-sagebrush-steppe/contract.js";
import FeaturesApplyContract from "./features-apply/contract.js";
import PedologyClassifyContract from "./pedology-classify/contract.js";

import PlanAquaticAtollPlacementsContract from "./plan-aquatic-atoll-placements/contract.js";
import PlanAquaticColdReefPlacementsContract from "./plan-aquatic-cold-reef-placements/contract.js";
import PlanAquaticLotusPlacementsContract from "./plan-aquatic-lotus-placements/contract.js";
import PlanAquaticReefPlacementsContract from "./plan-aquatic-reef-placements/contract.js";

import PlanIceContract from "./features-plan-ice/contract.js";
import PlanIceFeaturePlacementsContract from "./plan-ice-feature-placements/contract.js";
import PlanPlotEffectsContract from "./plan-plot-effects/contract.js";
import PlanReefEmbellishmentsReefContract from "./plan-reef-embellishments-reef/contract.js";
import PlanReefsContract from "./features-plan-reefs/contract.js";

import PlanVegetationEmbellishmentsForestDensityContract from "./plan-vegetation-embellishments-forest-density/contract.js";
import PlanVegetationEmbellishmentsRainforestDensityContract from "./plan-vegetation-embellishments-rainforest-density/contract.js";
import PlanVegetationEmbellishmentsTaigaDensityContract from "./plan-vegetation-embellishments-taiga-density/contract.js";
import PlanVegetationEmbellishmentsVolcanicForestContract from "./plan-vegetation-embellishments-volcanic-forest/contract.js";
import PlanVegetationEmbellishmentsVolcanicTaigaContract from "./plan-vegetation-embellishments-volcanic-taiga/contract.js";

import PlanWetPlacementMangroveContract from "./plan-wet-placement-mangrove/contract.js";
import PlanWetPlacementMarshContract from "./plan-wet-placement-marsh/contract.js";
import PlanWetPlacementOasisContract from "./plan-wet-placement-oasis/contract.js";
import PlanWetPlacementTundraBogContract from "./plan-wet-placement-tundra-bog/contract.js";
import PlanWetPlacementWateringHoleContract from "./plan-wet-placement-watering-hole/contract.js";

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

  planAquaticReefPlacements: PlanAquaticReefPlacementsContract,
  planAquaticColdReefPlacements: PlanAquaticColdReefPlacementsContract,
  planAquaticAtollPlacements: PlanAquaticAtollPlacementsContract,
  planAquaticLotusPlacements: PlanAquaticLotusPlacementsContract,

  planIceFeaturePlacements: PlanIceFeaturePlacementsContract,
  planPlotEffects: PlanPlotEffectsContract,
  planReefEmbellishmentsReef: PlanReefEmbellishmentsReefContract,

  planVegetationEmbellishmentsVolcanicForest: PlanVegetationEmbellishmentsVolcanicForestContract,
  planVegetationEmbellishmentsVolcanicTaiga: PlanVegetationEmbellishmentsVolcanicTaigaContract,
  planVegetationEmbellishmentsRainforestDensity: PlanVegetationEmbellishmentsRainforestDensityContract,
  planVegetationEmbellishmentsForestDensity: PlanVegetationEmbellishmentsForestDensityContract,
  planVegetationEmbellishmentsTaigaDensity: PlanVegetationEmbellishmentsTaigaDensityContract,

  planWetPlacementMarsh: PlanWetPlacementMarshContract,
  planWetPlacementTundraBog: PlanWetPlacementTundraBogContract,
  planWetPlacementMangrove: PlanWetPlacementMangroveContract,
  planWetPlacementOasis: PlanWetPlacementOasisContract,
  planWetPlacementWateringHole: PlanWetPlacementWateringHoleContract,

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
  ComputeVegetationSubstrateContract,
  ScoreVegetationForestContract,
  ScoreVegetationRainforestContract,
  ScoreVegetationTaigaContract,
  ScoreVegetationSavannaWoodlandContract,
  ScoreVegetationSagebrushSteppeContract,
  FeaturesApplyContract,
  PedologyClassifyContract,

  PlanAquaticAtollPlacementsContract,
  PlanAquaticColdReefPlacementsContract,
  PlanAquaticLotusPlacementsContract,
  PlanAquaticReefPlacementsContract,

  PlanIceContract,
  PlanIceFeaturePlacementsContract,
  PlanPlotEffectsContract,
  PlanReefEmbellishmentsReefContract,
  PlanReefsContract,

  PlanVegetationEmbellishmentsForestDensityContract,
  PlanVegetationEmbellishmentsRainforestDensityContract,
  PlanVegetationEmbellishmentsTaigaDensityContract,
  PlanVegetationEmbellishmentsVolcanicForestContract,
  PlanVegetationEmbellishmentsVolcanicTaigaContract,

  PlanWetPlacementMangroveContract,
  PlanWetPlacementMarshContract,
  PlanWetPlacementOasisContract,
  PlanWetPlacementTundraBogContract,
  PlanWetPlacementWateringHoleContract,

  PlanWetlandsContract,
  RefineBiomeEdgesContract,
  ResourcePlanBasinsContract,
  ResourceScoreBalanceContract,
};
