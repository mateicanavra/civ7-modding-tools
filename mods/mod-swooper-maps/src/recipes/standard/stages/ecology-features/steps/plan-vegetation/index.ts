import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology";
import { isAnyRiverClass } from "@mapgen/domain/hydrology";
import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import {
  validateFeatureIntentsListArtifact,
  validateOccupancyArtifact,
} from "../../../ecology/artifact-validation.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import PlanVegetationStepContract from "./contract.js";

const VEGETATION_FEATURE_INDEX_BY_KEY: Readonly<Record<string, number>> = {
  FEATURE_FOREST: (FEATURE_KEY_INDEX.FEATURE_FOREST ?? 0) + 1,
  FEATURE_RAINFOREST: (FEATURE_KEY_INDEX.FEATURE_RAINFOREST ?? 0) + 1,
  FEATURE_TAIGA: (FEATURE_KEY_INDEX.FEATURE_TAIGA ?? 0) + 1,
  FEATURE_SAVANNA_WOODLAND: (FEATURE_KEY_INDEX.FEATURE_SAVANNA_WOODLAND ?? 0) + 1,
  FEATURE_SAGEBRUSH_STEPPE: (FEATURE_KEY_INDEX.FEATURE_SAGEBRUSH_STEPPE ?? 0) + 1,
};

export default createStep(PlanVegetationStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsVegetation, ecologyArtifacts.occupancyVegetation],
    {
      featureIntentsVegetation: {
        validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
      },
      occupancyVegetation: {
        validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const prev = deps.artifacts.occupancyWetlands.read(context);
    const classification = deps.artifacts.biomeClassification.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const topography = deps.artifacts.topography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const volcanoes = deps.artifacts.volcanoes.read(context);
    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));
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

    const seed = ctxStepSeed(context, PlanVegetationStepContract.id, "ecology/plan-vegetation");
    const placements = ops.planVegetation(
      {
        width,
        height,
        seed,
        scoreForest01: scoreLayers.layers.FEATURE_FOREST,
        scoreRainforest01: scoreLayers.layers.FEATURE_RAINFOREST,
        scoreTaiga01: scoreLayers.layers.FEATURE_TAIGA,
        scoreSavannaWoodland01: scoreLayers.layers.FEATURE_SAVANNA_WOODLAND,
        scoreSagebrushSteppe01: scoreLayers.layers.FEATURE_SAGEBRUSH_STEPPE,
        landMask: topography.landMask,
        flatLandMask,
        biomeIndex: classification.biomeIndex,
        surfaceTemperature: classification.surfaceTemperature,
        effectiveMoisture: classification.effectiveMoisture,
        aridityIndex: classification.aridityIndex,
        vegetationDensity: classification.vegetationDensity,
        featureIndex: prev.featureIndex,
        reserved: prev.reserved,
      },
      config.planVegetation
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureIndex = new Uint16Array(prev.featureIndex);
    const reserved = new Uint8Array(prev.reserved);

    for (const placement of placements) {
      const feature = placement.feature;
      const index = VEGETATION_FEATURE_INDEX_BY_KEY[feature];
      if (!index) {
        throw new Error(
          `plan-vegetation expected vegetation-family placements (received ${feature})`
        );
      }
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        throw new Error(`plan-vegetation placement out of bounds: (${x},${y})`);
      }
      const idx = y * width + x;
      if (topography.landMask[idx] === 0) {
        throw new Error(`plan-vegetation attempted to claim water tileIndex=${idx} (${x},${y})`);
      }
      if (reserved[idx] !== 0) {
        throw new Error(`plan-vegetation attempted to claim reserved tileIndex=${idx} (${x},${y})`);
      }
      if (featureIndex[idx] !== 0) {
        throw new Error(`plan-vegetation attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureIndex[idx] = index;
    }

    deps.artifacts.featureIntentsVegetation.publish(context, placements);
    deps.artifacts.occupancyVegetation.publish(context, {
      width,
      height,
      featureIndex,
      reserved,
    });
  },
});
