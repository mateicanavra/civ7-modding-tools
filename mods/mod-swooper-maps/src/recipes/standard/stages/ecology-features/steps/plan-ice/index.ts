import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import {
  artifacts as ecologyArtifacts,
  validators as ecologyArtifactValidators,
} from "../../../ecology/artifacts/index.js";
import PlanIceStepContract from "./contract.js";

/**
 * Plans ice from its shared suitability layer after floodplains reserve tiles,
 * publishing truth-only intent and the occupancy snapshot consumed by reefs.
 */
export default createStep(PlanIceStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsIce, ecologyArtifacts.occupancyIce],
    {
      featureIntentsIce: {
        validate: ecologyArtifactValidators.featureIntentsIce,
      },
      occupancyIce: {
        validate: ecologyArtifactValidators.occupancyIce,
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const base = deps.artifacts.occupancyFloodplains.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const { width, height } = context.dimensions;

    const seed = ctxStepSeed(context, PlanIceStepContract.id, "ecology/plan-ice");
    const placements = ops.planIce(
      {
        width,
        height,
        seed,
        score01: scoreLayers.layers.ice,
        featureOccupancyMask: base.featureOccupancyMask,
        reserved: base.reserved,
      },
      config.planIce
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureOccupancyMask = new Uint8Array(base.featureOccupancyMask);
    const reserved = new Uint8Array(base.reserved);

    for (const placement of placements) {
      if (placement.feature !== "ice") {
        throw new Error(`plan-ice expected ice placements (received ${placement.feature})`);
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
      if (featureOccupancyMask[idx] !== 0) {
        throw new Error(`plan-ice attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureOccupancyMask[idx] = 1;
    }

    deps.artifacts.featureIntentsIce.publish(context, placements);
    deps.artifacts.occupancyIce.publish(context, {
      width,
      height,
      featureOccupancyMask,
      reserved,
    });
  },
});
