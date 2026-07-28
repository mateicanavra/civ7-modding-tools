import { isAnyRiverClass } from "../../../../../../../domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  assertFeatureIntentCandidatesAvailable,
  deriveFeatureOccupancy,
} from "../../model/policy/derive-feature-occupancy.js";
import { config } from "./config.js";

/**
 * Plans wetland-family intent from hydrology and habitat truth after admitted floodplain, ice,
 * and reef intents.
 */
export const PlanWetlandsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const floodplainIntents = deps.artifacts.floodplainIntents.read();
    const iceIntents = deps.artifacts.iceIntents.read();
    const reefIntents = deps.artifacts.reefIntents.read();
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
      reefIntents
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

    const seed = ctxStepSeed(context, config.id, "ecology/plan-wetlands");
    const placements = ops.planWetlands(
      {
        width,
        height,
        seed,
        scoreMarsh01: suitability.layers.marsh,
        scoreTundraBog01: suitability.layers["tundra-bog"],
        scoreMangrove01: suitability.layers.mangrove,
        scoreOasis01: suitability.layers.oasis,
        scoreWateringHole01: suitability.layers["watering-hole"],
        flatLandMask,
        featureOccupancyMask,
      },
      stepConfig.planWetlands
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
    assertFeatureIntentCandidatesAvailable(
      context.setup.dimensions,
      featureOccupancyMask,
      placements
    );
    deps.artifacts.wetlandIntents.publish(placements);
  },
});
