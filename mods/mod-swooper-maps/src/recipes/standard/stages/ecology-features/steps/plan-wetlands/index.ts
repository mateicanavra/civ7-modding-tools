import { isAnyRiverClass } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import PlanWetlandsStepContract from "./contract.js";
import { validators as ecologyArtifactValidators } from "../../../ecology/artifacts/index.js";

const WETLANDS_FEATURE_INTENTS = new Set([
  "marsh",
  "tundra-bog",
  "mangrove",
  "oasis",
  "watering-hole",
]);

export default createStep(PlanWetlandsStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsWetlands, ecologyArtifacts.occupancyWetlands],
    {
      featureIntentsWetlands: {
        validate: ecologyArtifactValidators.featureIntentsWetlands,
      },
      occupancyWetlands: {
        validate: ecologyArtifactValidators.occupancyWetlands,
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const prev = deps.artifacts.occupancyReefs.read(context);
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

    const seed = ctxStepSeed(context, PlanWetlandsStepContract.id, "ecology/plan-wetlands");
    const placements = ops.planWetlands(
      {
        width,
        height,
        seed,
        scoreMarsh01: scoreLayers.layers.marsh,
        scoreTundraBog01: scoreLayers.layers["tundra-bog"],
        scoreMangrove01: scoreLayers.layers.mangrove,
        scoreOasis01: scoreLayers.layers.oasis,
        scoreWateringHole01: scoreLayers.layers["watering-hole"],
        flatLandMask,
        featureOccupancyMask: prev.featureOccupancyMask,
        reserved: prev.reserved,
      },
      config.planWetlands
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureOccupancyMask = new Uint8Array(prev.featureOccupancyMask);
    const reserved = new Uint8Array(prev.reserved);

    for (const placement of placements) {
      const feature = placement.feature;
      if (!WETLANDS_FEATURE_INTENTS.has(feature)) {
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
      if (featureOccupancyMask[idx] !== 0) {
        throw new Error(`plan-wetlands attempted to claim occupied tileIndex=${idx} (${x},${y})`);
      }
      featureOccupancyMask[idx] = 1;
    }

    deps.artifacts.featureIntentsWetlands.publish(context, placements);
    deps.artifacts.occupancyWetlands.publish(context, {
      width,
      height,
      featureOccupancyMask,
      reserved,
    });
  },
});
