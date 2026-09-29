import { isAnyRiverClass } from "../../../../../../../domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  assertFeatureIntentCandidatesAvailable,
  deriveFeatureOccupancy,
} from "../../model/policy/derive-feature-occupancy.js";
import { config } from "./config.js";

/**
 * Closes feature planning by placing vegetation on habitat-valid flat land left by all admitted
 * upstream feature intents.
 */
export const PlanVegetationStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const floodplainIntents = deps.artifacts.floodplainIntents.read();
    const iceIntents = deps.artifacts.iceIntents.read();
    const reefIntents = deps.artifacts.reefIntents.read();
    const wetlandIntents = deps.artifacts.wetlandIntents.read();
    const classification = deps.artifacts.biomeClassification.read();
    const climateIndices = deps.artifacts.climateIndices.read();
    const suitability = deps.artifacts.featureSuitability.read();
    const hydrography = deps.artifacts.hydrography.read();
    const topography = deps.artifacts.topography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const mountains = deps.artifacts.mountains.read();
    const volcanoes = deps.artifacts.volcanoes.read();
    const { width, height } = context.setup.dimensions;
    const size = width * height;
    const featureOccupancyMask = deriveFeatureOccupancy(
      context.setup.dimensions,
      floodplainIntents,
      iceIntents,
      reefIntents,
      wetlandIntents
    );
    const flatLandMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      flatLandMask[i] =
        topography.landMask[i] === 1 &&
        !isAnyRiverClass(hydrography.riverClass[i]) &&
        lakePlan.lakeMask[i] !== 1 &&
        mountains.mountainMask[i] !== 1 &&
        mountains.hillMask[i] !== 1 &&
        volcanoes.volcanoMask[i] !== 1
          ? 1
          : 0;
    }

    const seed = ctxStepSeed(context, config.id, "ecology/plan-vegetation");
    const placements = ops.planVegetation(
      {
        width,
        height,
        seed,
        scoreForest01: suitability.layers.forest,
        scoreRainforest01: suitability.layers.rainforest,
        scoreTaiga01: suitability.layers.taiga,
        scoreSavannaWoodland01: suitability.layers["savanna-woodland"],
        scoreSagebrushSteppe01: suitability.layers["sagebrush-steppe"],
        landMask: topography.landMask,
        flatLandMask,
        biomeIndex: classification.biomeIndex,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        effectiveMoisture: climateIndices.effectiveMoisture,
        aridityIndex: climateIndices.aridityIndex,
        vegetationDensity: classification.vegetationDensity,
        featureOccupancyMask,
      },
      stepConfig.planVegetation
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
    assertFeatureIntentCandidatesAvailable(
      context.setup.dimensions,
      featureOccupancyMask,
      placements
    );
    deps.artifacts.vegetationIntents.publish(placements);
  },
});
