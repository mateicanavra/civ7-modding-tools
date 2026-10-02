import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  assertFeatureIntentCandidatesAvailable,
  deriveFeatureOccupancy,
} from "../../model/policy/derive-feature-occupancy.js";
import { config } from "./config.js";

/**
 * Plans external-water ice from shared suitability after floodplain intents claim their tiles.
 */
export const PlanIceStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const floodplainIntents = deps.artifacts.floodplainIntents.read();
    const suitability = deps.artifacts.featureSuitability.read();
    const topography = deps.artifacts.topography.read();
    const { width, height } = context.setup.dimensions;
    const featureOccupancyMask = deriveFeatureOccupancy(
      context.setup.dimensions,
      floodplainIntents
    );

    const seed = ctxStepSeed(context, config.id, "ecology/plan-ice");
    const placements = ops.planIce(
      {
        width,
        height,
        seed,
        externalWaterMask: topography.externalWaterMask,
        score01: suitability.layers.ice,
        featureOccupancyMask,
      },
      stepConfig.planIce
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
    assertFeatureIntentCandidatesAvailable(
      context.setup.dimensions,
      featureOccupancyMask,
      placements
    );
    deps.artifacts.iceIntents.publish(placements);
  },
});
