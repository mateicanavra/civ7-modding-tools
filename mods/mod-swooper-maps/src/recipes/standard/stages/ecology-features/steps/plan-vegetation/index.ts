import { isAnyRiverClass } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import {
  artifacts as ecologyArtifacts,
  validators as ecologyArtifactValidators,
} from "../../../ecology/artifacts/index.js";
import PlanVegetationStepContract from "./contract.js";

const VEGETATION_FEATURE_INTENTS = new Set([
  "forest",
  "rainforest",
  "taiga",
  "savanna-woodland",
  "sagebrush-steppe",
]);

export default createStep(PlanVegetationStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsVegetation, ecologyArtifacts.occupancyVegetation],
    {
      featureIntentsVegetation: {
        validate: ecologyArtifactValidators.featureIntentsVegetation,
      },
      occupancyVegetation: {
        validate: ecologyArtifactValidators.occupancyVegetation,
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
        scoreForest01: scoreLayers.layers.forest,
        scoreRainforest01: scoreLayers.layers.rainforest,
        scoreTaiga01: scoreLayers.layers.taiga,
        scoreSavannaWoodland01: scoreLayers.layers["savanna-woodland"],
        scoreSagebrushSteppe01: scoreLayers.layers["sagebrush-steppe"],
        landMask: topography.landMask,
        flatLandMask,
        biomeIndex: classification.biomeIndex,
        surfaceTemperature: classification.surfaceTemperature,
        effectiveMoisture: classification.effectiveMoisture,
        aridityIndex: classification.aridityIndex,
        vegetationDensity: classification.vegetationDensity,
        featureOccupancyMask: prev.featureOccupancyMask,
        reserved: prev.reserved,
      },
      config.planVegetation
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureOccupancyMask = new Uint8Array(prev.featureOccupancyMask);
    const reserved = new Uint8Array(prev.reserved);

    for (const placement of placements) {
      const feature = placement.feature;
      if (!VEGETATION_FEATURE_INTENTS.has(feature)) {
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
      if (featureOccupancyMask[idx] !== 0) {
        throw new Error(`plan-vegetation attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureOccupancyMask[idx] = 1;
    }

    deps.artifacts.featureIntentsVegetation.publish(context, placements);
    deps.artifacts.occupancyVegetation.publish(context, {
      width,
      height,
      featureOccupancyMask,
      reserved,
    });
  },
});
