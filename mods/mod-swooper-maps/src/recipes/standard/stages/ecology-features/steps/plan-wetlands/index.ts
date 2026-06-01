import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import {
  validateFeatureIntentsListArtifact,
  validateOccupancyArtifact,
} from "../../../ecology/artifact-validation.js";
import PlanWetlandsStepContract from "./contract.js";

const WETLANDS_FEATURE_INDEX_BY_KEY: Readonly<Record<string, number>> = {
  FEATURE_MARSH: (FEATURE_KEY_INDEX.FEATURE_MARSH ?? 0) + 1,
  FEATURE_TUNDRA_BOG: (FEATURE_KEY_INDEX.FEATURE_TUNDRA_BOG ?? 0) + 1,
  FEATURE_MANGROVE: (FEATURE_KEY_INDEX.FEATURE_MANGROVE ?? 0) + 1,
  FEATURE_OASIS: (FEATURE_KEY_INDEX.FEATURE_OASIS ?? 0) + 1,
  FEATURE_WATERING_HOLE: (FEATURE_KEY_INDEX.FEATURE_WATERING_HOLE ?? 0) + 1,
};

export default createStep(PlanWetlandsStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsWetlands, ecologyArtifacts.occupancyWetlands],
    {
      featureIntentsWetlands: {
        validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
      },
      occupancyWetlands: {
        validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const prev = deps.artifacts.occupancyReefs.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const { width, height } = context.dimensions;

    const seed = deriveStepSeed(context.env.seed, "ecology:planWetlands");
    const placements = ops.planWetlands(
      {
        width,
        height,
        seed,
        scoreMarsh01: scoreLayers.layers.FEATURE_MARSH,
        scoreTundraBog01: scoreLayers.layers.FEATURE_TUNDRA_BOG,
        scoreMangrove01: scoreLayers.layers.FEATURE_MANGROVE,
        scoreOasis01: scoreLayers.layers.FEATURE_OASIS,
        scoreWateringHole01: scoreLayers.layers.FEATURE_WATERING_HOLE,
        featureIndex: prev.featureIndex,
        reserved: prev.reserved,
      },
      config.planWetlands
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureIndex = new Uint16Array(prev.featureIndex);
    const reserved = new Uint8Array(prev.reserved);

    for (const placement of placements) {
      const feature = placement.feature;
      const index = WETLANDS_FEATURE_INDEX_BY_KEY[feature];
      if (!index) {
        throw new Error(`plan-wetlands expected wet-family placements (received ${feature})`);
      }
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        throw new Error(`plan-wetlands placement out of bounds: (${x},${y})`);
      }
      const idx = y * width + x;
      if (reserved[idx] !== 0) {
        throw new Error(`plan-wetlands attempted to claim reserved tileIndex=${idx} (${x},${y})`);
      }
      if (featureIndex[idx] !== 0) {
        throw new Error(`plan-wetlands attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureIndex[idx] = index;
    }

    deps.artifacts.featureIntentsWetlands.publish(context, placements);
    deps.artifacts.occupancyWetlands.publish(context, {
      width,
      height,
      featureIndex,
      reserved,
    });
  },
});

