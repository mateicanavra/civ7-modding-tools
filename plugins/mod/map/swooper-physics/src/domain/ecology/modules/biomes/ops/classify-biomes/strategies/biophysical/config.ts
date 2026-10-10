import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Applies biophysical climate thresholds per tile while preserving the water sentinel.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "biophysical",
  config: Type.Object(
    {
      /** Classification thresholds for Hydrology surface temperature (degrees C). */
      temperature: Type.Object(
        {
          polarCutoff: Type.Number({
            description: "Temperature threshold for polar zone classification (degrees C).",
            default: -5,
            minimum: -100,
            maximum: 100,
          }),
          tundraCutoff: Type.Number({
            description: "Temperature threshold for cold/tundra zone classification (degrees C).",
            default: 2,
            minimum: -100,
            maximum: 100,
          }),
          midLatitude: Type.Number({
            description: "Upper bound for temperate zone classification (degrees C).",
            default: 12,
            minimum: -100,
            maximum: 100,
          }),
          tropicalThreshold: Type.Number({
            description: "Temperature threshold for tropical zone classification (degrees C).",
            default: 24,
            minimum: -100,
            maximum: 100,
          }),
        },
        {
          description: "Biome classification thresholds for Hydrology surface temperature (degrees C).",
        }
      ),
      /** Moisture model knobs (thresholds only; no local effective-moisture derivation). */
      moisture: Type.Object(
        {
          thresholds: Type.Tuple(
            [
              Type.Number({
                description: "Arid threshold (effective moisture units).",
                default: 45,
                minimum: 0,
                maximum: 1000,
              }),
              Type.Number({
                description: "Semi-arid threshold (effective moisture units).",
                default: 90,
                minimum: 0,
                maximum: 1000,
              }),
              Type.Number({
                description: "Subhumid threshold (effective moisture units).",
                default: 140,
                minimum: 0,
                maximum: 1000,
              }),
              Type.Number({
                description: "Humid threshold (effective moisture units).",
                default: 190,
                minimum: 0,
                maximum: 1000,
              }),
            ],
            {
              default: [45, 90, 140, 190],
              description:
                "Moisture thresholds in plant effective-moisture units; polar categories retain atmospheric effective moisture.",
            }
          ),
        },
        {
          description:
            "Effective-moisture thresholds, with atmospheric moisture retained for polar categories and tropical transition context.",
        }
      ),
      /** Plant-stress responses, with atmospheric aridity retained for polar category shifts. */
      aridity: Type.Object(
        {
          moistureShiftThresholds: Type.Tuple(
            [
              Type.Number({
                description: "Aridity threshold for first moisture-zone shift (0..1).",
                default: 0.45,
                minimum: 0,
                maximum: 1,
              }),
              Type.Number({
                description: "Aridity threshold for second moisture-zone shift (0..1).",
                default: 0.7,
                minimum: 0,
                maximum: 1,
              }),
            ],
            {
              default: [0.45, 0.7],
              description: "Plant-stress thresholds that shift moisture zones toward drier classes; polar categories use atmospheric aridity.",
            }
          ),
          vegetationPenalty: Type.Number({
            description: "Vegetation dryness-stress weight applied from plant water stress (0..1).",
            default: 0.15,
            minimum: 0,
            maximum: 1,
          }),
        },
        {
          description: "Biome and vegetation responses to the Hydrology aridity index.",
        }
      ),
      /** Vegetation density model knobs (0..1 weights, soil modifiers). */
      vegetation: Type.Object(
        {
          base: Type.Number({
            description:
              "Baseline vegetation density (0..1). Acts as the floor even in marginal climates.",
            default: 0.2,
            minimum: 0,
            maximum: 1,
          }),
          moistureWeight: Type.Number({
            description:
              "Weight applied to effective moisture when computing vegetation density (scalar).",
            default: 0.55,
            minimum: 0,
            maximum: 10,
          }),
          moistureNormalizationPadding: Type.Number({
            description:
              "Padding added to humid threshold when normalizing moisture (effective moisture units).",
            default: 40,
            minimum: 0,
            maximum: 1000,
          }),
        },
        {
          description: "Vegetation density model knobs (base, moisture weight, normalization).",
        }
      ),
    },
    {
      description:
        "Biome classification parameters for temperature, moisture, aridity, and vegetation.",
    }
  ),
});
