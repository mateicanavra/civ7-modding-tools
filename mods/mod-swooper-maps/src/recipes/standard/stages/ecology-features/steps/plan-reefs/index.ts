import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlanReefsStepContract from "./contract.js";

const REEF_FEATURE_INTENTS = new Set(["reef", "cold-reef", "atoll", "lotus"]);

/**
 * Plans reef-family intent against lake truth and post-ice occupancy, then
 * advances the deterministic reservation chain to wetland planning.
 */
export default createStep(PlanReefsStepContract, {
  run: (context, config, ops, deps) => {
    const prev = deps.artifacts.occupancyIce.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const { width, height } = context.dimensions;

    const seed = ctxStepSeed(context, PlanReefsStepContract.id, "ecology/plan-reefs");
    const placements = ops.planReefs(
      {
        width,
        height,
        seed,
        scoreReef01: scoreLayers.layers.reef,
        scoreColdReef01: scoreLayers.layers["cold-reef"],
        scoreAtoll01: scoreLayers.layers.atoll,
        scoreLotus01: scoreLayers.layers.lotus,
        lakeMask: lakePlan.lakeMask,
        featureOccupancyMask: prev.featureOccupancyMask,
        reserved: prev.reserved,
      },
      config.planReefs
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureOccupancyMask = new Uint8Array(prev.featureOccupancyMask);
    const reserved = new Uint8Array(prev.reserved);

    for (const placement of placements) {
      const feature = placement.feature;
      if (!REEF_FEATURE_INTENTS.has(feature)) {
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
      if (featureOccupancyMask[idx] !== 0) {
        throw new Error(`plan-reefs attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureOccupancyMask[idx] = 1;
    }

    deps.artifacts.featureIntentsReefs.publish(context, placements);
    deps.artifacts.occupancyReefs.publish(context, {
      width,
      height,
      featureOccupancyMask,
      reserved,
    });
  },
});
