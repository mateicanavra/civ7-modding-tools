import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines wind, Ekman, gyre, and coastal weights plus smoothing, divergence-projection, and output
 * budgets for the default current posture. Defaults retain every component while bounding both
 * solver cost and quantized speed.
 */
export default defineStrategy({
  id: "wind-gyre-projection",
  config: Type.Object(
    {
      /** Max speed used for quantization to i8 (higher = weaker output for same internal field). */
      maxSpeed: Type.Number({
        default: 80,
        minimum: 1,
        maximum: 400,
        description:
          "Max speed used for quantization to i8 (higher = weaker output for same internal field).",
      }),
      /** Wind imprint strength (along-wind component). */
      windStrength: Type.Number({
        default: 0.55,
        minimum: 0,
        maximum: 2,
        description: "Wind imprint strength (along-wind component).",
      }),
      /** Ekman deflection strength (cross-wind component; hemisphere-aware). */
      ekmanStrength: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 2,
        description: "Ekman deflection strength (cross-wind component; hemisphere-aware).",
      }),
      /** Basin gyre strength (requires basinId; ignored if absent). */
      gyreStrength: Type.Number({
        default: 26,
        minimum: 0,
        maximum: 200,
        description: "Basin gyre strength (requires basinId; ignored if absent).",
      }),
      /** Coast-aligned boundary current strength (requires coastTangent; ignored if absent). */
      coastStrength: Type.Number({
        default: 32,
        minimum: 0,
        maximum: 200,
        description:
          "Coast-aligned boundary current strength (requires coastTangent; ignored if absent).",
      }),
      /** Bounded smoothing passes over water tiles. */
      smoothIters: Type.Integer({
        default: 3,
        minimum: 0,
        maximum: 16,
        description: "Bounded smoothing passes over water tiles.",
      }),
      /** Bounded Jacobi iterations for divergence reduction (water-only). */
      projectionIters: Type.Integer({
        default: 8,
        minimum: 0,
        maximum: 64,
        description: "Bounded Jacobi iterations for divergence reduction (water-only).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Weights wind, Ekman, basin-gyre, and coastal evidence, then bounds smoothing, divergence reduction, and i8 current quantization.",
    }
  ),
});
