import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Latitude bands and seeded jet variation provide a deterministic low-cost prevailing-wind fallback. */
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
      description: "Atmospheric circulation parameters (latitude strategy).",
    }
  ),
});
