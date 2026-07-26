import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const StrategySchema = Type.Object(
  {
    plumeCount: Type.Integer({
      default: 6,
      minimum: 0,
      maximum: 32,
      description: "Upwelling source count (deterministic Poisson-disk placement).",
    }),
    downwellingCount: Type.Integer({
      default: 6,
      minimum: 0,
      maximum: 32,
      description: "Downwelling source count (deterministic Poisson-disk placement).",
    }),
    plumeRadius: Type.Number({
      default: 0.18,
      minimum: 0.05,
      maximum: 1,
      description: "Controls the mesh-distance radius of each upwelling source.",
    }),
    downwellingRadius: Type.Number({
      default: 0.18,
      minimum: 0.05,
      maximum: 1,
      description: "Controls the mesh-distance radius of each downwelling source.",
    }),
    plumeAmplitude: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 10,
      description: "Sets the positive amplitude applied by each upwelling source.",
    }),
    downwellingAmplitude: Type.Number({
      default: -1,
      minimum: -10,
      maximum: 0,
      description: "Sets the negative amplitude applied by each downwelling source.",
    }),
    smoothingIterations: Type.Integer({
      default: 2,
      minimum: 0,
      maximum: 4,
      description:
        "Controls how many Laplacian smoothing iterations are applied to mantle potential.",
    }),
    smoothingAlpha: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Diffusion alpha used during Laplacian smoothing.",
    }),
    minSeparationScale: Type.Number({
      default: 0.85,
      minimum: 0,
      maximum: 2,
      description:
        "Sets the minimum source separation scale relative to radius for Poisson-disk placement.",
    }),
  },
  { additionalProperties: false }
);

/**
 * Contract for constructing a deterministic mantle potential field over the Foundation mesh.
 * Its authored source and smoothing controls feed forcing generation without exposing implementation rules.
 */
const ComputeMantlePotentialContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mantle-potential",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          neighborsOffsets: TypedArraySchemas.i32({ cardinality: null }),
          neighbors: TypedArraySchemas.i32({ cardinality: null }),
        },
        { additionalProperties: false }
      ),
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic RNG seed (derived in the step; pure data).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      mantlePotential: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          cellCount: Type.Integer({ minimum: 1 }),
          potential: TypedArraySchemas.f32({ cardinality: null }),
          sourceCount: Type.Integer({ minimum: 0 }),
          sourceType: TypedArraySchemas.i8({ cardinality: null }),
          sourceCell: TypedArraySchemas.u32({ cardinality: null }),
          sourceAmplitude: TypedArraySchemas.f32({ cardinality: null }),
          sourceRadius: TypedArraySchemas.f32({ cardinality: null }),
        },
        {
          additionalProperties: false,
          description: "Mantle potential and the signed sources that generated it.",
        }
      ),
    },
    { additionalProperties: false }
  ),
  strategies: {
    "poisson-source-field": StrategySchema,
  },
});

export default ComputeMantlePotentialContract;
