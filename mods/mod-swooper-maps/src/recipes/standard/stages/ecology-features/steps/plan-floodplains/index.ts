import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology";
import { ctxStepSeed, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import PlanFloodplainsStepContract from "./contract.js";
import { validators as ecologyArtifactValidators } from "../../../ecology/artifacts/index.js";

const FLOODPLAIN_FEATURE_INDEX_BY_KEY: Readonly<Record<string, number>> = {
  FEATURE_DESERT_FLOODPLAIN_MINOR: (FEATURE_KEY_INDEX.FEATURE_DESERT_FLOODPLAIN_MINOR ?? 0) + 1,
  FEATURE_DESERT_FLOODPLAIN_NAVIGABLE:
    (FEATURE_KEY_INDEX.FEATURE_DESERT_FLOODPLAIN_NAVIGABLE ?? 0) + 1,
  FEATURE_GRASSLAND_FLOODPLAIN_MINOR:
    (FEATURE_KEY_INDEX.FEATURE_GRASSLAND_FLOODPLAIN_MINOR ?? 0) + 1,
  FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE:
    (FEATURE_KEY_INDEX.FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE ?? 0) + 1,
  FEATURE_PLAINS_FLOODPLAIN_MINOR: (FEATURE_KEY_INDEX.FEATURE_PLAINS_FLOODPLAIN_MINOR ?? 0) + 1,
  FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE:
    (FEATURE_KEY_INDEX.FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE ?? 0) + 1,
  FEATURE_TROPICAL_FLOODPLAIN_MINOR: (FEATURE_KEY_INDEX.FEATURE_TROPICAL_FLOODPLAIN_MINOR ?? 0) + 1,
  FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE:
    (FEATURE_KEY_INDEX.FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE ?? 0) + 1,
  FEATURE_TUNDRA_FLOODPLAIN_MINOR: (FEATURE_KEY_INDEX.FEATURE_TUNDRA_FLOODPLAIN_MINOR ?? 0) + 1,
  FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE:
    (FEATURE_KEY_INDEX.FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE ?? 0) + 1,
};
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
        scoreDesertMinor01: scoreLayers.layers.FEATURE_DESERT_FLOODPLAIN_MINOR,
        scoreDesertNavigable01: scoreLayers.layers.FEATURE_DESERT_FLOODPLAIN_NAVIGABLE,
        scoreGrasslandMinor01: scoreLayers.layers.FEATURE_GRASSLAND_FLOODPLAIN_MINOR,
        scoreGrasslandNavigable01: scoreLayers.layers.FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE,
        scorePlainsMinor01: scoreLayers.layers.FEATURE_PLAINS_FLOODPLAIN_MINOR,
        scorePlainsNavigable01: scoreLayers.layers.FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE,
        scoreTropicalMinor01: scoreLayers.layers.FEATURE_TROPICAL_FLOODPLAIN_MINOR,
        scoreTropicalNavigable01: scoreLayers.layers.FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE,
        scoreTundraMinor01: scoreLayers.layers.FEATURE_TUNDRA_FLOODPLAIN_MINOR,
        scoreTundraNavigable01: scoreLayers.layers.FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE,
        featureIndex: base.featureIndex,
        reserved: base.reserved,
      },
      config.planFloodplains
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));

    const featureIndex = new Uint16Array(base.featureIndex);
    const reserved = new Uint8Array(base.reserved);
    const floodplainIntentMask = new Uint8Array(width * height);

    for (const placement of placements) {
      const feature = placement.feature;
      const index = FLOODPLAIN_FEATURE_INDEX_BY_KEY[feature];
      if (!index) {
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
      if (featureIndex[idx] !== 0) {
        throw new Error(
          `plan-floodplains attempted to claim occupied tileIndex=${idx} (${x},${y})`
        );
      }
      featureIndex[idx] = index;
      floodplainIntentMask[idx] = 1;
    }

    deps.artifacts.featureIntentsFloodplains.publish(context, placements);
    deps.artifacts.occupancyFloodplains.publish(context, {
      width,
      height,
      featureIndex,
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
