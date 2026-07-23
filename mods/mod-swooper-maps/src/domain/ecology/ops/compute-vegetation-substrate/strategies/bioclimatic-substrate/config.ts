import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects bioclimatic evidence onto stable zero-to-one planning fields without selecting features.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "bioclimatic-substrate",
  config: Type.Object(
    {
      moistureNormalization: Type.Number({
        description:
          "Effective moisture value mapped to water01=1.0. Default aligns with humid threshold + padding in biome classification.",
        default: 230,
        minimum: 1,
        maximum: 1000,
      }),
      temperatureMinC: Type.Number({
        description: "Surface temperature (C) mapped to energy01=0.0.",
        default: -20,
        minimum: -100,
        maximum: 100,
      }),
      temperatureMaxC: Type.Number({
        description: "Surface temperature (C) mapped to energy01=1.0.",
        default: 40,
        minimum: -100,
        maximum: 100,
      }),
    },
    {
      additionalProperties: false,
      description:
        "Normalization constants for vegetation substrate fields. Keep these stable and minimal; upstream physics should drive realism.",
    }
  ),
});
