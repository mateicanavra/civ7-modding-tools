import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines separate land and ocean evaporation strengths plus the active temperature window.
 * Defaults make open water the dominant moisture source while retaining weak land evaporation.
 */
export default defineStrategy({
  id: "thermal-surface",
  config: Type.Object(
    {
      /** Evaporation multiplier applied to water tiles. */
      oceanStrength: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 5,
        description: "Evaporation multiplier applied to water tiles.",
      }),
      /** Evaporation multiplier applied to land tiles. */
      landStrength: Type.Number({
        default: 0.2,
        minimum: 0,
        maximum: 5,
        description: "Evaporation multiplier applied to land tiles.",
      }),
      /** Temperature threshold below which evaporation is ~0. */
      minTempC: Type.Number({
        default: -10,
        minimum: -60,
        maximum: 40,
        description: "Temperature threshold below which evaporation is ~0.",
      }),
      /** Temperature threshold above which evaporation is saturated. */
      maxTempC: Type.Number({
        default: 30,
        minimum: -10,
        maximum: 80,
        description: "Temperature threshold above which evaporation is saturated.",
      }),
    },
    {
      additionalProperties: false,
      description: "Evaporation source parameters (thermal-surface strategy).",
    }
  ),
});
