import AggregatePedologyContract from "./pedology-aggregate/contract.js";
import BiomeClassificationContract from "./classify-biomes/contract.js";
import ComputeFeatureSubstrateContract from "./compute-feature-substrate/contract.js";
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

import PlanVegetatedPlacementForestContract from "./plan-vegetated-placement-forest/contract.js";
import PlanVegetatedPlacementRainforestContract from "./plan-vegetated-placement-rainforest/contract.js";
import PlanVegetatedPlacementSagebrushSteppeContract from "./plan-vegetated-placement-sagebrush-steppe/contract.js";
import PlanVegetatedPlacementSavannaWoodlandContract from "./plan-vegetated-placement-savanna-woodland/contract.js";
import PlanVegetatedPlacementTaigaContract from "./plan-vegetated-placement-taiga/contract.js";

import PlanVegetationForestContract from "./features-plan-vegetation-forest/contract.js";
import PlanVegetationRainforestContract from "./features-plan-vegetation-rainforest/contract.js";
import PlanVegetationSagebrushSteppeContract from "./features-plan-vegetation-sagebrush-steppe/contract.js";
import PlanVegetationSavannaWoodlandContract from "./features-plan-vegetation-savanna-woodland/contract.js";
import PlanVegetationTaigaContract from "./features-plan-vegetation-taiga/contract.js";

import PlanVegetationEmbellishmentsForestDensityContract from "./plan-vegetation-embellishments-forest-density/contract.js";
import PlanVegetationEmbellishmentsRainforestDensityContract from "./plan-vegetation-embellishments-rainforest-density/contract.js";
import PlanVegetationEmbellishmentsTaigaDensityContract from "./plan-vegetation-embellishments-taiga-density/contract.js";
import PlanVegetationEmbellishmentsVolcanicForestContract from "./plan-vegetation-embellishments-volcanic-forest/contract.js";
import PlanVegetationEmbellishmentsVolcanicTaigaContract from "./plan-vegetation-embellishments-volcanic-taiga/contract.js";

import PlanWetFeaturePlacementsContract from "./plan-wet-feature-placements/contract.js";
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

  planAquaticReefPlacements: PlanAquaticReefPlacementsContract,
  planAquaticColdReefPlacements: PlanAquaticColdReefPlacementsContract,
  planAquaticAtollPlacements: PlanAquaticAtollPlacementsContract,
  planAquaticLotusPlacements: PlanAquaticLotusPlacementsContract,

  planIceFeaturePlacements: PlanIceFeaturePlacementsContract,
  planPlotEffects: PlanPlotEffectsContract,
  planReefEmbellishmentsReef: PlanReefEmbellishmentsReefContract,

  planVegetatedPlacementForest: PlanVegetatedPlacementForestContract,
  planVegetatedPlacementRainforest: PlanVegetatedPlacementRainforestContract,
  planVegetatedPlacementTaiga: PlanVegetatedPlacementTaigaContract,
  planVegetatedPlacementSavannaWoodland: PlanVegetatedPlacementSavannaWoodlandContract,
  planVegetatedPlacementSagebrushSteppe: PlanVegetatedPlacementSagebrushSteppeContract,

  planVegetationEmbellishmentsVolcanicForest: PlanVegetationEmbellishmentsVolcanicForestContract,
  planVegetationEmbellishmentsVolcanicTaiga: PlanVegetationEmbellishmentsVolcanicTaigaContract,
  planVegetationEmbellishmentsRainforestDensity: PlanVegetationEmbellishmentsRainforestDensityContract,
  planVegetationEmbellishmentsForestDensity: PlanVegetationEmbellishmentsForestDensityContract,
  planVegetationEmbellishmentsTaigaDensity: PlanVegetationEmbellishmentsTaigaDensityContract,

  planWetFeaturePlacements: PlanWetFeaturePlacementsContract,
  planWetPlacementMarsh: PlanWetPlacementMarshContract,
  planWetPlacementTundraBog: PlanWetPlacementTundraBogContract,
  planWetPlacementMangrove: PlanWetPlacementMangroveContract,
  planWetPlacementOasis: PlanWetPlacementOasisContract,
  planWetPlacementWateringHole: PlanWetPlacementWateringHoleContract,

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

  PlanAquaticAtollPlacementsContract,
  PlanAquaticColdReefPlacementsContract,
  PlanAquaticLotusPlacementsContract,
  PlanAquaticReefPlacementsContract,

  PlanIceContract,
  PlanIceFeaturePlacementsContract,
  PlanPlotEffectsContract,
  PlanReefEmbellishmentsReefContract,
  PlanReefsContract,

  PlanVegetatedPlacementForestContract,
  PlanVegetatedPlacementRainforestContract,
  PlanVegetatedPlacementSagebrushSteppeContract,
  PlanVegetatedPlacementSavannaWoodlandContract,
  PlanVegetatedPlacementTaigaContract,

  PlanVegetationForestContract,
  PlanVegetationRainforestContract,
  PlanVegetationSagebrushSteppeContract,
  PlanVegetationSavannaWoodlandContract,
  PlanVegetationTaigaContract,

  PlanVegetationEmbellishmentsForestDensityContract,
  PlanVegetationEmbellishmentsRainforestDensityContract,
  PlanVegetationEmbellishmentsTaigaDensityContract,
  PlanVegetationEmbellishmentsVolcanicForestContract,
  PlanVegetationEmbellishmentsVolcanicTaigaContract,

  PlanWetFeaturePlacementsContract,
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

export type { PlanWetFeaturePlacementsTypes } from "./plan-wet-feature-placements/types.js";

