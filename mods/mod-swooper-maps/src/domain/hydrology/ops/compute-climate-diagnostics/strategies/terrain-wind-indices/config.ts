import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Terrain and wind neighborhoods measure rain shadow, continentality, and convergence from one climate state. */
export default defineStrategy({
  id: "terrain-wind-indices",
  config: Type.Object(
    {
      /** How far upwind to scan for barriers (tiles). */
      barrierSteps: Type.Integer({
        default: 4,
        minimum: 1,
        maximum: 16,
        description: "How far upwind to scan for barriers (tiles).",
      }),
      /** Elevation threshold treated as a barrier when estimating rain shadow. */
      barrierElevationM: Type.Integer({
        default: 500,
        minimum: 0,
        maximum: 9000,
        description: "Elevation threshold treated as a barrier when estimating rain shadow.",
      }),
      /** Distance-to-water value mapped to continentalityIndex=1 (tiles). */
      continentalityMaxDist: Type.Integer({
        default: 12,
        minimum: 1,
        maximum: 80,
        description: "Distance-to-water value mapped to continentalityIndex=1 (tiles).",
      }),
      /** Normalization factor for convergence proxy from wind divergence. */
      convergenceNormalization: Type.Number({
        default: 64,
        minimum: 1,
        maximum: 512,
        description: "Normalization factor for convergence proxy from wind divergence.",
      }),
    },
    {
      additionalProperties: false,
      description: "Diagnostic climate indices parameters (terrain-wind-indices strategy).",
    }
  ),
});
