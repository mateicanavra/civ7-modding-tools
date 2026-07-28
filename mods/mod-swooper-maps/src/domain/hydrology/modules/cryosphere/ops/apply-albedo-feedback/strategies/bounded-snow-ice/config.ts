import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the fixed feedback budget, snow and sea-ice cooling strengths, phase thresholds, and hard
 * temperature bounds. The default four passes provide visible feedback without a convergence loop.
 */
export default defineStrategy({
  id: "bounded-snow-ice",
  config: Type.Object(
    {
      /** Fixed iteration count for bounded feedback (no convergence loops). */
      iterations: Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 20,
        description: "Fixed iteration count for bounded feedback (no convergence loops).",
      }),
      /** Cooling applied at full snow cover (C). */
      snowCoolingC: Type.Number({
        default: 4,
        minimum: 0,
        maximum: 25,
        description: "Cooling applied at full snow cover (C).",
      }),
      /** Cooling applied at full sea ice cover (C). */
      seaIceCoolingC: Type.Number({
        default: 6,
        minimum: 0,
        maximum: 30,
        description: "Cooling applied at full sea ice cover (C).",
      }),
      /** Minimum allowed output temperature (C). */
      minC: Type.Number({
        default: -60,
        minimum: -120,
        maximum: 60,
        description: "Minimum allowed output temperature (C).",
      }),
      /** Maximum allowed output temperature (C). */
      maxC: Type.Number({
        default: 60,
        minimum: -60,
        maximum: 120,
        description: "Maximum allowed output temperature (C).",
      }),
      /** Temperature at which snow starts to accumulate on land (C). */
      landSnowStartC: Type.Number({
        default: 0,
        minimum: -60,
        maximum: 30,
        description: "Temperature at which snow starts to accumulate on land (C).",
      }),
      /** Temperature at which land snow cover is saturated (C). */
      landSnowFullC: Type.Number({
        default: -12,
        minimum: -80,
        maximum: 10,
        description: "Temperature at which land snow cover is saturated (C).",
      }),
      /** Temperature at which sea ice starts to form (C). */
      seaIceStartC: Type.Number({
        default: -1,
        minimum: -60,
        maximum: 10,
        description: "Temperature at which sea ice starts to form (C).",
      }),
      /** Temperature at which sea ice cover is saturated (C). */
      seaIceFullC: Type.Number({
        default: -10,
        minimum: -80,
        maximum: 10,
        description: "Temperature at which sea ice cover is saturated (C).",
      }),
      /** How much rainfall boosts snow cover accumulation (dimensionless). */
      precipitationInfluence: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 1,
        description: "How much rainfall boosts snow cover accumulation (dimensionless).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Bounds fixed-pass snow and sea-ice cooling with shared phase thresholds and hard temperature limits, avoiding convergence-dependent output.",
    }
  ),
});
