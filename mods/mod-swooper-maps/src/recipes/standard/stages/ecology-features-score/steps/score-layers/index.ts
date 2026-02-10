import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import {
  validateOccupancyArtifact,
  validateScoreLayersArtifact,
} from "../../../ecology/artifact-validation.js";
import ScoreLayersStepContract from "./contract.js";

export default createStep(ScoreLayersStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.scoreLayers, ecologyArtifacts.occupancyBase], {
    scoreLayers: {
      validate: (value, context) => validateScoreLayersArtifact(value, context.dimensions),
    },
    occupancyBase: {
      validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
    },
  }),
  run: (context, config, ops, deps) => {
    const classification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const topography = deps.artifacts.topography.read(context);
    const coastline = deps.artifacts.coastlineMetrics.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);

    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));

    const vegetationSubstrate = ops.vegetationSubstrate(
      {
        width,
        height,
        landMask: topography.landMask,
        effectiveMoisture: classification.effectiveMoisture,
        surfaceTemperature: classification.surfaceTemperature,
        aridityIndex: classification.aridityIndex,
        freezeIndex: classification.freezeIndex,
        vegetationDensity: classification.vegetationDensity,
        fertility: pedology.fertility,
      },
      config.vegetationSubstrate
    );

    const forestScore = ops.vegetationScoreForest(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.vegetationScoreForest
    ).score01;
    const rainforestScore = ops.vegetationScoreRainforest(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.vegetationScoreRainforest
    ).score01;
    const taigaScore = ops.vegetationScoreTaiga(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.vegetationScoreTaiga
    ).score01;
    const savannaWoodlandScore = ops.vegetationScoreSavannaWoodland(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.vegetationScoreSavannaWoodland
    ).score01;
    const sagebrushSteppeScore = ops.vegetationScoreSagebrushSteppe(
      { width, height, landMask: topography.landMask, ...vegetationSubstrate },
      config.vegetationScoreSagebrushSteppe
    ).score01;

    const featureSubstrate = ops.featureSubstrate(
      {
        width,
        height,
        riverClass: hydrography.riverClass,
        landMask: topography.landMask,
      },
      config.featureSubstrate
    );

    deps.artifacts.scoreLayers.publish(context, {
      width,
      height,
      layers: {
        FEATURE_FOREST: forestScore,
        FEATURE_RAINFOREST: rainforestScore,
        FEATURE_TAIGA: taigaScore,
        FEATURE_SAVANNA_WOODLAND: savannaWoodlandScore,
        FEATURE_SAGEBRUSH_STEPPE: sagebrushSteppeScore,
        FEATURE_MARSH: new Float32Array(size),
        FEATURE_TUNDRA_BOG: new Float32Array(size),
        FEATURE_MANGROVE: new Float32Array(size),
        FEATURE_OASIS: new Float32Array(size),
        FEATURE_WATERING_HOLE: new Float32Array(size),
        FEATURE_REEF: new Float32Array(size),
        FEATURE_COLD_REEF: new Float32Array(size),
        FEATURE_ATOLL: new Float32Array(size),
        FEATURE_LOTUS: new Float32Array(size),
        FEATURE_ICE: new Float32Array(size),
      },
    });

    const featureIndex = new Uint16Array(size);
    const reserved = new Uint8Array(size);

    for (let i = 0; i < size; i++) {
      const deepWater = topography.landMask[i] === 0 && coastline.shelfMask[i] === 0;
      const navigableRiver = featureSubstrate.navigableRiverMask[i] === 1;
      reserved[i] = deepWater || navigableRiver ? 1 : 0;
    }

    deps.artifacts.occupancyBase.publish(context, {
      width,
      height,
      featureIndex,
      reserved,
    });
  },
});

