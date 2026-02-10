import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import {
  validateFeatureIntentsListArtifact,
  validateOccupancyArtifact,
} from "../../../ecology/artifact-validation.js";
import PlanReefsStepContract from "./contract.js";

const REEFS_FEATURE_INDEX_BY_KEY: Readonly<Record<string, number>> = {
  FEATURE_REEF: (FEATURE_KEY_INDEX.FEATURE_REEF ?? 0) + 1,
  FEATURE_COLD_REEF: (FEATURE_KEY_INDEX.FEATURE_COLD_REEF ?? 0) + 1,
  FEATURE_ATOLL: (FEATURE_KEY_INDEX.FEATURE_ATOLL ?? 0) + 1,
  FEATURE_LOTUS: (FEATURE_KEY_INDEX.FEATURE_LOTUS ?? 0) + 1,
};

export default createStep(PlanReefsStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.featureIntentsReefs, ecologyArtifacts.occupancyReefs], {
    featureIntentsReefs: {
      validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
    },
    occupancyReefs: {
      validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
    },
  }),
  run: (context, config, ops, deps) => {
    const prev = deps.artifacts.occupancyIce.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const { width, height } = context.dimensions;

    const seed = deriveStepSeed(context.env.seed, "ecology:planReefs");
    const placements = ops.planReefs(
      {
        width,
        height,
        seed,
        scoreReef01: scoreLayers.layers.FEATURE_REEF,
        scoreColdReef01: scoreLayers.layers.FEATURE_COLD_REEF,
        scoreAtoll01: scoreLayers.layers.FEATURE_ATOLL,
        scoreLotus01: scoreLayers.layers.FEATURE_LOTUS,
        featureIndex: prev.featureIndex,
        reserved: prev.reserved,
      },
      config.planReefs
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureIndex = new Uint16Array(prev.featureIndex);
    const reserved = new Uint8Array(prev.reserved);

    for (const placement of placements) {
      const feature = placement.feature;
      const index = REEFS_FEATURE_INDEX_BY_KEY[feature];
      if (!index) {
        throw new Error(`plan-reefs expected reef-family placements (received ${feature})`);
      }
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        throw new Error(`plan-reefs placement out of bounds: (${x},${y})`);
      }
      const idx = y * width + x;
      if (reserved[idx] !== 0) {
        throw new Error(`plan-reefs attempted to claim reserved tileIndex=${idx} (${x},${y})`);
      }
      if (featureIndex[idx] !== 0) {
        throw new Error(`plan-reefs attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureIndex[idx] = index;
    }

    deps.artifacts.featureIntentsReefs.publish(context, placements);
    deps.artifacts.occupancyReefs.publish(context, {
      width,
      height,
      featureIndex,
      reserved,
    });
  },
});

