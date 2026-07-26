import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  assertFeatureIntentCandidatesAvailable,
  deriveFeatureOccupancy,
} from "../../model/policy/derive-feature-occupancy.js";
import { config } from "./config.js";

/**
 * Plans reef-family intent against lake truth after admitted floodplain and ice intents.
 */
export const PlanReefsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const floodplainIntents = deps.artifacts.floodplainIntents.read(context);
    const iceIntents = deps.artifacts.iceIntents.read(context);
    const suitability = deps.artifacts.featureSuitability.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const { width, height } = context.setup.dimensions;
    const featureOccupancyMask = deriveFeatureOccupancy(
      context.setup.dimensions,
      floodplainIntents,
      iceIntents
    );

    const seed = ctxStepSeed(context, config.id, "ecology/plan-reefs");
    const placements = ops.planReefs(
      {
        width,
        height,
        seed,
        scoreReef01: suitability.layers.reef,
        scoreColdReef01: suitability.layers["cold-reef"],
        scoreAtoll01: suitability.layers.atoll,
        scoreLotus01: suitability.layers.lotus,
        lakeMask: lakePlan.lakeMask,
        featureOccupancyMask,
      },
      stepConfig.planReefs
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
    assertFeatureIntentCandidatesAvailable(
      context.setup.dimensions,
      featureOccupancyMask,
      placements
    );
    deps.artifacts.reefIntents.publish(context, placements);
  },
});
