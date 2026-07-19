import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Base relief shaping controls (tectonic expression into elevation).
 */
const ReliefConfigSchema = Type.Object(
  {
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
      description:
        "Controls blend factor for smoothing crust edges before terrain relief is published (0..1).",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    /** Amplitude of base noise injected into crust elevations (0..1). */
    crustNoiseAmplitude: Type.Number({
      description:
        "Controls amplitude of base noise injected into crust elevations for map relief variation (0..1).",
      default: 0.1,
      minimum: 0,
      maximum: 1,
    }),
    /** Baseline elevation for continental crust (normalized units). */
    continentalHeight: Type.Number({
      description:
        "Controls baseline map elevation for continental crust in normalized relief units.",
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
    tectonics: Type.Object(
      {
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
          description:
            "Controls grain of tectonic fractal noise in terrain relief (higher = finer).",
          default: 4,
          minimum: 1,
          maximum: 64,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls how Foundation tectonic signals become base terrain relief.",
      }
    ),
  },
  {
    additionalProperties: false,
    description:
      "Relief controls for translating Foundation crust and tectonic signals into map terrain elevation.",
  }
);

/**
 * Converts crust isostasy baseline + tectonic potentials into the initial elevation field.
 */
const ComputeBaseTopographyContract = defineOp({
  kind: "compute",
  id: "morphology/compute-base-topography",
  input: Type.Object({
    /** Map width in tiles. */
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    /** Map height in tiles. */
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    /** Isostatic base elevation proxy per tile (0..1), projected from mesh crust truth. */
    crustBaseElevation: TypedArraySchemas.f32({
      description:
        "Isostatic base elevation proxy per tile (0..1), projected from mesh crust truth.",
    }),
    /** Boundary proximity per tile (0..255). */
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({
      description: "Uplift potential per tile (0..255).",
    }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({
      description: "Rift potential per tile (0..255).",
    }),
    /** Seed for deterministic base-topography noise. */
    rngSeed: Type.Integer({ description: "Seed for deterministic base-topography noise." }),
  }),
  output: Type.Object({
    /** Base elevation per tile (normalized, scaled to int16). */
    elevation: TypedArraySchemas.i16({
      description: "Base elevation per tile (normalized, scaled to int16).",
    }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: ReliefConfigSchema,
  },
});

export default ComputeBaseTopographyContract;
