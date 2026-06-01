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
    description: "Blend factor for smoothing crust edges (0..1).",
    default: 0.45,
    minimum: 0,
    maximum: 1,
  }),
  /** Amplitude of base noise injected into crust elevations (0..1). */
  crustNoiseAmplitude: Type.Number({
    description: "Amplitude of base noise injected into crust elevations (0..1).",
    default: 0.1,
    minimum: 0,
    maximum: 1,
  }),
  /** Baseline elevation for continental crust (normalized units). */
  continentalHeight: Type.Number({
    description: "Baseline elevation for continental crust (normalized units).",
    default: 0.32,
  }),
  /** Baseline elevation for oceanic crust (normalized units). */
  oceanicHeight: Type.Number({
    description: "Baseline elevation for oceanic crust (normalized units).",
    default: -0.55,
  }),
  /** Tectonic weighting used while shaping base topography. */
  tectonics: Type.Object({
    interiorNoiseWeight: Type.Number({
      description: "Blend factor for plate-interior noise.",
      default: 0.5,
      minimum: 0,
    }),
    boundaryArcWeight: Type.Number({
      description: "Multiplier for convergent boundary uplift arcs.",
      default: 0.55,
      minimum: 0,
    }),
    boundaryArcNoiseWeight: Type.Number({
      description: "Raggedness injected into boundary arcs.",
      default: 0.2,
      minimum: 0,
    }),
    fractalGrain: Type.Number({
      description: "Grain of tectonic fractal noise (higher = finer).",
      default: 4,
      minimum: 1,
    }),
  }),
});

export type ReliefConfig = Static<typeof ReliefConfigSchema>;
