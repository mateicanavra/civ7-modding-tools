import { ctxStepSeed, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import PlanFloodplainsStepContract from "./contract.js";
import { validators as ecologyArtifactValidators } from "../../../ecology/artifacts/index.js";

const FLOODPLAIN_FEATURE_INTENTS = new Set([
  "desert-floodplain-minor",
  "desert-floodplain-navigable",
  "grassland-floodplain-minor",
  "grassland-floodplain-navigable",
  "plains-floodplain-minor",
  "plains-floodplain-navigable",
  "tropical-floodplain-minor",
  "tropical-floodplain-navigable",
  "tundra-floodplain-minor",
  "tundra-floodplain-navigable",
]);
const GROUP_ECOLOGY_FEATURES = "Ecology / Features";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(PlanFloodplainsStepContract, {
  artifacts: implementArtifacts(
    [ecologyArtifacts.featureIntentsFloodplains, ecologyArtifacts.occupancyFloodplains],
    {
      featureIntentsFloodplains: {
        validate: ecologyArtifactValidators.featureIntentsFloodplains,
      },
      occupancyFloodplains: {
        validate: ecologyArtifactValidators.occupancyFloodplains,
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const base = deps.artifacts.occupancyBase.read(context);
    const scoreLayers = deps.artifacts.scoreLayers.read(context);
    const { width, height } = context.dimensions;

    const seed = ctxStepSeed(context, PlanFloodplainsStepContract.id, "ecology/plan-floodplains");
    const placements = ops.planFloodplains(
      {
        width,
        height,
        seed,
        scoreDesertMinor01: scoreLayers.layers["desert-floodplain-minor"],
        scoreDesertNavigable01: scoreLayers.layers["desert-floodplain-navigable"],
        scoreGrasslandMinor01: scoreLayers.layers["grassland-floodplain-minor"],
        scoreGrasslandNavigable01: scoreLayers.layers["grassland-floodplain-navigable"],
        scorePlainsMinor01: scoreLayers.layers["plains-floodplain-minor"],
        scorePlainsNavigable01: scoreLayers.layers["plains-floodplain-navigable"],
        scoreTropicalMinor01: scoreLayers.layers["tropical-floodplain-minor"],
        scoreTropicalNavigable01: scoreLayers.layers["tropical-floodplain-navigable"],
        scoreTundraMinor01: scoreLayers.layers["tundra-floodplain-minor"],
        scoreTundraNavigable01: scoreLayers.layers["tundra-floodplain-navigable"],
        featureOccupancyMask: base.featureOccupancyMask,
        reserved: base.reserved,
      },
      config.planFloodplains
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureOccupancyMask = new Uint8Array(base.featureOccupancyMask);
    const reserved = new Uint8Array(base.reserved);
    const floodplainIntentMask = new Uint8Array(width * height);

    for (const placement of placements) {
      const feature = placement.feature;
      if (!FLOODPLAIN_FEATURE_INTENTS.has(feature)) {
        throw new Error(
          `plan-floodplains expected floodplain-family placements (received ${feature})`
        );
      }
      const x = placement.x | 0;
      const y = placement.y | 0;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        throw new Error(`plan-floodplains placement out of bounds: (${x},${y})`);
      }
      const idx = y * width + x;
      if (reserved[idx] !== 0) {
        throw new Error(
          `plan-floodplains attempted to claim reserved tileIndex=${idx} (${x},${y})`
        );
      }
      if (featureOccupancyMask[idx] !== 0) {
        throw new Error(
          `plan-floodplains attempted to claim occupied tileIndex=${idx} (${x},${y})`
        );
      }
      featureOccupancyMask[idx] = 1;
      floodplainIntentMask[idx] = 1;
    }

    deps.artifacts.featureIntentsFloodplains.publish(context, placements);
    deps.artifacts.occupancyFloodplains.publish(context, {
      width,
      height,
      featureOccupancyMask,
      reserved,
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.features.floodplainIntentMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: floodplainIntentMask,
      meta: defineVizMeta("ecology.features.floodplainIntentMask", {
        label: "Floodplain Intent Mask",
        group: GROUP_ECOLOGY_FEATURES,
        palette: "categorical",
        role: "intent",
      }),
    });
  },
});
