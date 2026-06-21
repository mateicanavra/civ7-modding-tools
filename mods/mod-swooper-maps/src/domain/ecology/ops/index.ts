import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import classifyBiomes from "./classify-biomes/index.js";
import computeFeatureSubstrate from "./compute-feature-substrate/index.js";
import computeVegetationSubstrate from "./compute-vegetation-substrate/index.js";
import type { contracts } from "./contracts.js";
import applyFeatures from "./features-apply/index.js";
import planFloodplains from "./features-plan-floodplains/index.js";
import planIce from "./features-plan-ice/index.js";
import planReefs from "./features-plan-reefs/index.js";
import planVegetation from "./features-plan-vegetation/index.js";
import planWetlands from "./features-plan-wetlands/index.js";
import scoreIce from "./ice-score-ice/index.js";
import aggregatePedology from "./pedology-aggregate/index.js";
import classifyPedology from "./pedology-classify/index.js";
import planPlotEffects from "./plan-plot-effects/index.js";
import scorePlotEffectsBurned from "./plot-effects-score-burned/index.js";
import scorePlotEffectsJungle from "./plot-effects-score-jungle/index.js";
import scorePlotEffectsSand from "./plot-effects-score-sand/index.js";
import scorePlotEffectsSnow from "./plot-effects-score-snow/index.js";
import scoreReefAtoll from "./reef-score-atoll/index.js";
import scoreColdReef from "./reef-score-cold-reef/index.js";
import scoreReefLotus from "./reef-score-lotus/index.js";
import scoreReef from "./reef-score-reef/index.js";
import refineBiomeEdges from "./refine-biome-edges/index.js";
import planResourceBasins from "./resource-plan-basins/index.js";
import scoreResourceBasins from "./resource-score-balance/index.js";
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

  scorePlotEffectsSnow,
  scorePlotEffectsSand,
  scorePlotEffectsBurned,
  scorePlotEffectsJungle,
  planPlotEffects,

  planFloodplains,
  planWetlands,
  planReefs,
  planIce,
  planVegetation,

  applyFeatures,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export {
  aggregatePedology,
  applyFeatures,
  classifyBiomes,
  classifyPedology,
  computeFeatureSubstrate,
  computeVegetationSubstrate,
  planFloodplains,
  planIce,
  planPlotEffects,
  planReefs,
  planResourceBasins,
  planVegetation,
  planWetlands,
  refineBiomeEdges,
  scoreColdReef,
  scoreIce,
  scorePlotEffectsBurned,
  scorePlotEffectsJungle,
  scorePlotEffectsSand,
  scorePlotEffectsSnow,
  scoreReef,
  scoreReefAtoll,
  scoreReefLotus,
  scoreResourceBasins,
  scoreVegetationForest,
  scoreVegetationRainforest,
  scoreVegetationSagebrushSteppe,
  scoreVegetationSavannaWoodland,
  scoreVegetationTaiga,
  scoreWetMangrove,
  scoreWetMarsh,
  scoreWetOasis,
  scoreWetTundraBog,
  scoreWetWateringHole,
};
