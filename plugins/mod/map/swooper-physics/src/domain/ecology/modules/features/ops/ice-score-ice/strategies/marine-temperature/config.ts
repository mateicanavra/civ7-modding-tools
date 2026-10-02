import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Scores current climate temperature on eligible physical external-water recipients.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "marine-temperature",
  config: Type.Object(
    {
      seaTempColdC: Type.Number({
        default: -10,
        minimum: -100,
        maximum: 100,
        description: "Sea temperature where ice suitability is strongest.",
      }),
      seaTempWarmC: Type.Number({
        default: -2,
        minimum: -100,
        maximum: 100,
        description: "Warm sea-temperature limit for ice suitability.",
      }),
    },
    {
      additionalProperties: false,
      description: "Current climate temperature breakpoints for marine-eligible ice suitability.",
    }
  ),
});
