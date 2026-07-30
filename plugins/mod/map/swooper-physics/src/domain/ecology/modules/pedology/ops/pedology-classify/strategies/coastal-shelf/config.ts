import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Emphasizes sediment and moisture to represent productive coastal-shelf soils.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "coastal-shelf",
  config: Type.Object(
    {
      climateWeight: Type.Number({
        minimum: 0,
        maximum: 5,
        default: 1.2,
        description: "Controls the influence of rainfall and humidity on soil fertility.",
      }),
      reliefWeight: Type.Number({
        minimum: 0,
        maximum: 5,
        default: 0.8,
        description: "Controls the fertility penalty from steep or rugged terrain.",
      }),
      sedimentWeight: Type.Number({
        minimum: 0,
        maximum: 5,
        default: 1.1,
        description: "Controls the influence of sediment depth on soil fertility.",
      }),
      bedrockWeight: Type.Number({
        minimum: 0,
        maximum: 5,
        default: 0.6,
        description: "Controls the influence of bedrock age on soil fertility.",
      }),
      fertilityCeiling: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.95,
        description: "Caps the normalized fertility score assigned to a tile.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Coastal-shelf pedology controls. Authored weights establish the baseline before this strategy emphasizes sediment-rich, moisture-supported fertility.",
    }
  ),
});
