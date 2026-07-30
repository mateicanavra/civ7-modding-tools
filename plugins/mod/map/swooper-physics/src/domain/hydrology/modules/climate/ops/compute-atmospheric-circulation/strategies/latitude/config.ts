import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Exposes jet count, strength, and directional variance for the inexpensive latitude fallback.
 * Defaults use three moderately variable bands when the product circulation model is not selected.
 */
export default defineStrategy({
  id: "latitude",
  config: Type.Object(
    {
      /** Number of jet stream bands influencing storm tracks (higher = more bands). */
      windJetStreaks: Type.Integer({
        default: 3,
        minimum: 0,
        maximum: 12,
        description: "Number of jet stream bands influencing storm tracks.",
      }),
      /** Overall jet stream intensity multiplier (higher = stronger prevailing winds). */
      windJetStrength: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 5,
        description: "Overall jet stream intensity multiplier.",
      }),
      /** Directional variance applied to winds (higher = noisier/more variable). */
      windVariance: Type.Number({
        default: 0.6,
        minimum: 0,
        maximum: 2,
        description: "Directional variance applied to winds.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Shapes the inexpensive latitude-band wind fallback through jet count, overall strength, and directional variance.",
    }
  ),
});
