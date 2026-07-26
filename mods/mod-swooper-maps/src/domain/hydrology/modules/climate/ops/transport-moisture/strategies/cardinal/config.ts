import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the fixed pass count, donor influence, and retention for the cardinal transport fallback.
 * Defaults trade directional precision for a stable, inexpensive 28-pass moisture field.
 */
export default defineStrategy({
  id: "cardinal",
  config: Type.Object(
    {
      /** Fixed advection iterations (no convergence loops). */
      iterations: Type.Integer({
        default: 28,
        minimum: 0,
        maximum: 200,
        description: "Fixed advection iterations (no convergence loops).",
      }),
      /** How much upwind humidity influences a tile each step. */
      advection: Type.Number({
        default: 0.65,
        minimum: 0,
        maximum: 1,
        description: "How much upwind humidity influences a tile each step.",
      }),
      /** How much humidity is retained per iteration. */
      retention: Type.Number({
        default: 0.92,
        minimum: 0,
        maximum: 1,
        description: "How much humidity is retained per iteration.",
      }),
    },
    {
      additionalProperties: false,
      description: "Moisture transport parameters for the cardinal strategy.",
    }
  ),
});
