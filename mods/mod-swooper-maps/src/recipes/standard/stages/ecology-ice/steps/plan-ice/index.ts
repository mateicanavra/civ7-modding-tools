import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import {
  validateFeatureIntentsListArtifact,
  validateOccupancyArtifact,
} from "../../../ecology/artifact-validation.js";
import PlanIceStepContract from "./contract.js";

export default createStep(PlanIceStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.featureIntentsIce, ecologyArtifacts.occupancyIce], {
    featureIntentsIce: {
      validate: (value, context) => validateFeatureIntentsListArtifact(value, context.dimensions),
    },
    occupancyIce: {
      validate: (value, context) => validateOccupancyArtifact(value, context.dimensions),
    },
  }),
  run: (context, config, ops, deps) => {
    const base = deps.artifacts.occupancyBase.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const { width, height } = context.dimensions;

    const seed = deriveStepSeed(context.env.seed, "ecology:planIce");
    const placements = ops.planIce(
      {
        width,
        height,
        seed,
        score01: scoreLayers.layers.FEATURE_ICE,
        featureIndex: base.featureIndex,
        reserved: base.reserved,
      },
      config.planIce
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const iceIndex = (FEATURE_KEY_INDEX.FEATURE_ICE ?? 0) + 1;
    const featureIndex = new Uint16Array(base.featureIndex);
    const reserved = new Uint8Array(base.reserved);

    for (const placement of placements) {
      if (placement.feature !== "FEATURE_ICE") {
        throw new Error(`plan-ice expected FEATURE_ICE placements (received ${placement.feature})`);
      }
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        throw new Error(`plan-ice placement out of bounds: (${x},${y})`);
      }
      const idx = y * width + x;
      if (reserved[idx] !== 0) {
        throw new Error(`plan-ice attempted to claim reserved tileIndex=${idx} (${x},${y})`);
      }
      if (featureIndex[idx] !== 0) {
        throw new Error(`plan-ice attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureIndex[idx] = iceIndex;
    }

    deps.artifacts.featureIntentsIce.publish(context, placements);
    deps.artifacts.occupancyIce.publish(context, {
      width,
      height,
      featureIndex,
      reserved,
    });
  },
});
