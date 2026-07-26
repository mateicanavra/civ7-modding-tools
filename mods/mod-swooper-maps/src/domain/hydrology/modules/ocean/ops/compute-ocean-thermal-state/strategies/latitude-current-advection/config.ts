import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines equatorial and polar SST anchors, fixed advection and diffusion controls, donor cutoff,
 * and the shared sea-ice threshold. Defaults use 28 bounded passes so current coupling is visible
 * without convergence-dependent output.
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
      /** Minimum normalized weight for a secondary upcurrent neighbor to be considered. */
      secondaryWeightMin: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 1,
        description:
          "Minimum normalized weight for a secondary upcurrent neighbor to be considered.",
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
      description: "Ocean thermal parameters (latitude-current-advection strategy).",
    }
  ),
});
