import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the analytic backbone, pressure-driven RMS budget, equatorial transition, and output
 * scale for Hydrology's default circulation posture.
 */
export default defineStrategy({
  id: "geostrophic-proxy",
  config: Type.Object(
    {
      /** Physical vector magnitude represented by signed-byte magnitude 127. */
      maxSpeed: Type.Number({
        default: 130,
        minimum: 1,
        maximum: 400,
        description:
          "Physical vector magnitude mapped to signed-byte magnitude 127. Composed winds above this envelope clip while a higher value encodes the same field more weakly.",
      }),
      /** Base zonal (east-west) circulation strength. */
      zonalStrength: Type.Number({
        default: 100,
        minimum: 0,
        maximum: 300,
        description: "Base zonal (east-west) circulation strength.",
      }),
      /** Base meridional (north-south) circulation strength. */
      meridionalStrength: Type.Number({
        default: 15,
        minimum: 0,
        maximum: 200,
        description:
          "Base meridional circulation strength. Runtime structure clamps it to at most 0.35 times zonalStrength.",
      }),
      /** Target RMS strength of the pressure-gradient weather perturbation. */
      pressureDrivenRms: Type.Number({
        default: 35,
        minimum: 0,
        maximum: 400,
        description:
          "Target RMS strength of the pressure-gradient weather perturbation, capped against the analytic backbone.",
      }),
      /** Bounded smoothing passes over the vector field (higher = smoother, less noisy). */
      smoothIters: Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 16,
        description:
          "Bounded smoothing passes over the vector field (higher = smoother, less noisy).",
      }),
      /** Width of the equatorial transition from geostrophic to down-gradient flow. */
      equatorialTaperDeg: Type.Number({
        default: 18,
        minimum: 0,
        maximum: 45,
        description:
          "Latitude width in degrees where weakening Coriolis response blends geostrophic flow into down-gradient flow.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Controls the analytic circulation backbone, budgeted pressure-driven perturbation, equatorial transition, smoothing, and magnitude-preserving i8 quantization.",
    }
  ),
});
