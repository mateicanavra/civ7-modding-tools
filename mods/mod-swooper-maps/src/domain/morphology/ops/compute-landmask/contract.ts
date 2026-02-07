import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const LandmaskConfigSchema = Type.Object(
  {
    continentPotentialGrain: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description: "Coarse grain (tile block size) used to low-pass continent potential before thresholding.",
    }),
    continentPotentialBlurSteps: Type.Integer({
      default: 3,
      minimum: 0,
      maximum: 16,
      description: "Number of hex-neighborhood blur passes applied after coarse-grain averaging.",
    }),
    keepLandComponentFraction: Type.Number({
      default: 0.985,
      minimum: 0.5,
      maximum: 1,
      description:
        "Fraction of land tiles to keep by retaining only the largest connected components (removes speckle islands).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Landmask shaping controls. Landmask is derived from Foundation crust truth + provenance stability (continent potential), not from noise-first thresholding.",
  }
);

/**
 * Derives the land mask and coastline distance field from a low-frequency continent potential grounded in Foundation truth.
 */
const ComputeLandmaskContract = defineOp({
  kind: "compute",
  id: "morphology/compute-landmask",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (normalized units)." }),
    seaLevel: Type.Number({ description: "Sea level threshold." }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    crustType: TypedArraySchemas.u8({
      description: "Foundation crust type per tile (0=oceanic, 1=continental).",
    }),
    crustBaseElevation: TypedArraySchemas.f32({
      description: "Foundation crust base elevation proxy per tile (0..1).",
    }),
    crustAge: TypedArraySchemas.u8({
      description: "Foundation crust age bucket per tile (0..255).",
    }),
    provenanceOriginEra: TypedArraySchemas.u8({
      description: "Foundation provenance origin era per tile (0..eraCount-1).",
    }),
    provenanceDriftDistance: TypedArraySchemas.u8({
      description: "Foundation provenance drift distance bucket per tile (0..255).",
    }),
  }),
  output: Type.Object({
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    distanceToCoast: TypedArraySchemas.u16({
      description: "Distance to nearest coast in tiles (0=coast).",
    }),
  }),
  strategies: {
    default: LandmaskConfigSchema,
  },
});

export default ComputeLandmaskContract;
