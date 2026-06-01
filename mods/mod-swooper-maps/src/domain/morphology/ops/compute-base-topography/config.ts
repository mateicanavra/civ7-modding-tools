import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Base relief shaping controls (tectonic expression into elevation).
 */
export const ReliefConfigSchema = Type.Object({
  /** Closeness bonus favoring tiles near plate boundaries (0..1). */
  boundaryBias: Type.Number({
    description: "Closeness bonus favoring tiles near plate boundaries (0..1).",
    default: 0,
    minimum: 0,
    maximum: 1,
  }),
  /** Bias that clusters continental plates together. */
  clusteringBias: Type.Number({
    description:
      "Bias that clusters continental plates together; higher values encourage supercontinents.",
    default: 0,
    minimum: 0,
    maximum: 1,
  }),
  /** Blend factor for smoothing crust edges (0..1). */
  crustEdgeBlend: Type.Number({
    description: "Controls blend factor for smoothing crust edges before terrain relief is published (0..1).",
    default: 0.45,
    minimum: 0,
    maximum: 1,
  }),
  /** Amplitude of base noise injected into crust elevations (0..1). */
  crustNoiseAmplitude: Type.Number({
    description: "Controls amplitude of base noise injected into crust elevations for map relief variation (0..1).",
    default: 0.1,
    minimum: 0,
    maximum: 1,
  }),
  /** Baseline elevation for continental crust (normalized units). */
  continentalHeight: Type.Number({
    description: "Controls baseline map elevation for continental crust in normalized relief units.",
    default: 0.32,
    minimum: -2,
    maximum: 2,
  }),
  /** Baseline elevation for oceanic crust (normalized units). */
  oceanicHeight: Type.Number({
    description: "Controls baseline map elevation for oceanic crust in normalized relief units.",
    default: -0.55,
    minimum: -2,
    maximum: 2,
  }),
  /** Tectonic weighting used while shaping base topography. */
  tectonics: Type.Object({
    interiorNoiseWeight: Type.Number({
      description: "Controls plate-interior terrain noise weight in base topography.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    boundaryArcWeight: Type.Number({
      description: "Controls convergent boundary uplift arc weight in base terrain relief.",
      default: 0.55,
      minimum: 0,
      maximum: 10,
    }),
    boundaryArcNoiseWeight: Type.Number({
      description: "Controls raggedness injected into tectonic boundary arcs.",
      default: 0.2,
      minimum: 0,
      maximum: 10,
    }),
    fractalGrain: Type.Number({
      description: "Controls grain of tectonic fractal noise in terrain relief (higher = finer).",
      default: 4,
      minimum: 1,
      maximum: 64,
    }),
  }, {
    additionalProperties: false,
    description: "Controls how Foundation tectonic signals become base terrain relief.",
  }),
}, {
  additionalProperties: false,
  description: "Relief controls for translating Foundation crust and tectonic signals into map terrain elevation.",
});

export type ReliefConfig = Static<typeof ReliefConfigSchema>;
