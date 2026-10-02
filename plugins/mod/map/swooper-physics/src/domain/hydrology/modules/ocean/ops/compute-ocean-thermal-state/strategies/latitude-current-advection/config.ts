import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines equatorial and polar SST anchors, fixed advection and diffusion controls,
 * and the shared sea-ice threshold. Relative current magnitude controls the self/donor blend;
 * defaults use 28 bounded passes without convergence-dependent output or an elapsed-time claim.
 */
export default defineStrategy({
  id: "latitude-current-advection",
  config: Type.Object(
    {
      /** Equator baseline SST (C). */
      equatorTempC: Type.Number({
        default: 28,
        minimum: -10,
        maximum: 60,
        description: "Equator baseline SST (C).",
      }),
      /** Pole baseline SST (C). */
      poleTempC: Type.Number({
        default: -2,
        minimum: -10,
        maximum: 20,
        description: "Pole baseline SST (C).",
      }),
      /** Fixed advection iterations (no convergence loops). */
      advectIters: Type.Integer({
        default: 28,
        minimum: 0,
        maximum: 300,
        description: "Fixed advection iterations (no convergence loops).",
      }),
      /** Diffusion strength (0..1) mixed into each iteration. */
      diffusion: Type.Number({
        default: 0.18,
        minimum: 0,
        maximum: 1,
        description: "Diffusion strength (0..1) mixed into each iteration.",
      }),
      /** SST threshold at which sea ice forms (C). */
      seaIceThresholdC: Type.Number({
        default: -1,
        minimum: -10,
        maximum: 5,
        description: "SST threshold at which sea ice forms (C).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Sets the latitude SST baseline, fixed relative-strength advection passes and subsequent diffusion, then classifies sea ice from the resulting temperature field.",
    }
  ),
});
