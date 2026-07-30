import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines angular-velocity bounds, optional one-pass forcing smoothing, and residual-diagnostic
 * resolution for rigid plate fitting. Defaults leave forcing unsmoothed and all fit scales neutral.
 */
export default defineStrategy({
  id: "rigid-body-fit",
  config: Type.Object(
    {
      omegaFactor: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description: "Controls how mantle mean speed scales fitted plate angular velocity.",
      }),
      plateRadiusMin: Type.Number({
        default: 1,
        minimum: 1e-3,
        maximum: 1e6,
        description: "Minimum plate radius (mesh units) used when clamping angular velocity.",
      }),
      residualNormScale: Type.Number({
        default: 1,
        minimum: 0.01,
        maximum: 10,
        description:
          "Controls mean-forcing normalization for residual diagnostics used to judge plate motion fit.",
      }),
      p90NormScale: Type.Number({
        default: 1,
        minimum: 0.01,
        maximum: 10,
        description: "Scale factor applied to mean forcing speed when normalizing plate quality.",
      }),
      histogramBins: Type.Integer({
        default: 32,
        minimum: 8,
        maximum: 128,
        description: "Number of histogram buckets used for per-plate P90 residual estimation.",
      }),
      smoothingSteps: Type.Integer({
        default: 0,
        minimum: 0,
        maximum: 1,
        description:
          "Controls whether one smoothing pass is applied to the forcing field before plate motion fitting.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Rigid-body plate-motion controls for angular-velocity scaling, forcing smoothing, and residual-fit quality evidence.",
    }
  ),
});
