import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** One or two vector-weighted upwind neighbors advect evaporation-sourced humidity with bounded retention. */
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
      /** Minimum normalized weight for a secondary upwind neighbor to be considered. */
      secondaryWeightMin: Type.Number({
        default: 0.2,
        minimum: 0,
        maximum: 1,
        description: "Minimum normalized weight for a secondary upwind neighbor to be considered.",
      }),
    },
    {
      additionalProperties: false,
      description: "Moisture transport parameters for the vector-advection strategy.",
    }
  ),
});
