import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines fixed pass count, donor influence, and retention for vector transport.
 * Adjacent upwind rays always retain their geometric shares, including shares held at bounded edges.
 */
export default defineStrategy({
  id: "vector-advection",
  config: Type.Object(
    {
      /** Fixed advection iterations (no convergence loops). */
      iterations: Type.Integer({
        default: 22,
        minimum: 0,
        maximum: 200,
        description: "Fixed advection iterations (no convergence loops).",
      }),
      /** How much upwind humidity influences a tile each step. */
      advection: Type.Number({
        default: 0.7,
        minimum: 0,
        maximum: 1,
        description: "How much upwind humidity influences a tile each step.",
      }),
      /** How much humidity is retained per iteration. */
      retention: Type.Number({
        default: 0.93,
        minimum: 0,
        maximum: 1,
        description: "How much humidity is retained per iteration.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Bounds fixed-pass mixing of local evaporation with adjacent upwind rays; calm wind and off-map shares sample self without a latitude fallback.",
    }
  ),
});
