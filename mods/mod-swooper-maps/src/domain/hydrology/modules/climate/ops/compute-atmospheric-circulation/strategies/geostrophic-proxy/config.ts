import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Pressure gradients, planetary waves, land heating, and orography produce coherent tile-varying winds without a fluid simulation. */
export default defineStrategy({
  id: "geostrophic-proxy",
  config: Type.Object(
    {
      /** Max physical-ish speed used for quantization to i8 (higher = weaker output for same internal field). */
      maxSpeed: Type.Number({
        default: 110,
        minimum: 1,
        maximum: 400,
        description:
          "Max speed used for quantization to i8 (higher = weaker output for the same computed wind field).",
      }),
      /** Base zonal (east-west) circulation strength. */
      zonalStrength: Type.Number({
        default: 90,
        minimum: 0,
        maximum: 300,
        description: "Base zonal (east-west) circulation strength.",
      }),
      /** Base meridional (north-south) circulation strength. */
      meridionalStrength: Type.Number({
        default: 30,
        minimum: 0,
        maximum: 200,
        description: "Base meridional (north-south) circulation strength.",
      }),
      /** Strength of geostrophic-like flow derived from a pressure gradient proxy. */
      geostrophicStrength: Type.Number({
        default: 70,
        minimum: 0,
        maximum: 400,
        description: "Strength of geostrophic-like flow derived from a pressure gradient proxy.",
      }),
      /** Spatial scale (in tiles) for pressure noise. */
      pressureNoiseScale: Type.Number({
        default: 18,
        minimum: 2,
        maximum: 128,
        description: "Spatial scale (in tiles) for pressure noise.",
      }),
      /** Amplitude of pressure noise (higher = more meander/eddies). */
      pressureNoiseAmp: Type.Number({
        default: 55,
        minimum: 0,
        maximum: 400,
        description: "Amplitude of pressure noise (higher = more meander/eddies).",
      }),
      /** Planetary wave strength (longitude-dependent meanders). */
      waveStrength: Type.Number({
        default: 45,
        minimum: 0,
        maximum: 300,
        description: "Planetary wave strength (longitude-dependent meanders).",
      }),
      /** Land heating influence (requires `landMask`; ignored if absent). */
      landHeatStrength: Type.Number({
        default: 20,
        minimum: 0,
        maximum: 200,
        description: "Land heating influence (requires landMask; ignored if absent).",
      }),
      /** Orography influence (requires `elevation`; ignored if absent). */
      mountainDeflectStrength: Type.Number({
        default: 18,
        minimum: 0,
        maximum: 200,
        description: "Orography influence (requires elevation; ignored if absent).",
      }),
      /** Bounded smoothing passes over the vector field (higher = smoother, less noisy). */
      smoothIters: Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 16,
        description:
          "Bounded smoothing passes over the vector field (higher = smoother, less noisy).",
      }),
    },
    {
      additionalProperties: false,
      description: "Atmospheric circulation parameters for the geostrophic-proxy strategy.",
    }
  ),
});
