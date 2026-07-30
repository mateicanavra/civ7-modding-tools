import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { deriveFeatureOccupancy } from "../../model/policy/derive-feature-occupancy.js";
import { config } from "./config.js";

const GROUP_ECOLOGY_FEATURES = "Ecology / Features";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Plans floodplain-family intent first, establishing the admitted intent set that gates ice
 * planning.
 */
export const PlanFloodplainsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const suitability = deps.artifacts.featureSuitability.read();
    const { width, height } = context.setup.dimensions;

    const seed = ctxStepSeed(context, config.id, "ecology/plan-floodplains");
    const placements = ops.planFloodplains(
      {
        width,
        height,
        seed,
        scoreDesertMinor01: suitability.layers["desert-floodplain-minor"],
        scoreDesertNavigable01: suitability.layers["desert-floodplain-navigable"],
        scoreGrasslandMinor01: suitability.layers["grassland-floodplain-minor"],
        scoreGrasslandNavigable01: suitability.layers["grassland-floodplain-navigable"],
        scorePlainsMinor01: suitability.layers["plains-floodplain-minor"],
        scorePlainsNavigable01: suitability.layers["plains-floodplain-navigable"],
        scoreTropicalMinor01: suitability.layers["tropical-floodplain-minor"],
        scoreTropicalNavigable01: suitability.layers["tropical-floodplain-navigable"],
        scoreTundraMinor01: suitability.layers["tundra-floodplain-minor"],
        scoreTundraNavigable01: suitability.layers["tundra-floodplain-navigable"],
        featureOccupancyMask: new Uint8Array(width * height),
      },
      stepConfig.planFloodplains
    ).placements;

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
    const admittedIntents = deps.artifacts.floodplainIntents.publish(placements);
    return deriveFeatureOccupancy(context.setup.dimensions, admittedIntents);
  },
  viz: ({ observation: floodplainIntentMask, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "ecology.features.floodplainIntentMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: floodplainIntentMask },
      meta: defineStandardVizMeta("ecology.features.floodplainIntentMask", "category.distinct", {
        label: "Floodplain Intent Mask",
        group: GROUP_ECOLOGY_FEATURES,
        role: "intent",
      }),
    },
  ],
});
