import { TypedArraySchemas, Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";

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
      description: "Upwelling source radius in mesh-distance units.",
    }),
    downwellingRadius: Type.Number({
      default: 0.18,
      minimum: 0.05,
      maximum: 1,
      description: "Downwelling source radius in mesh-distance units.",
    }),
    plumeAmplitude: Type.Number({
      default: 1,
      description: "Upwelling source amplitude (positive).",
    }),
    downwellingAmplitude: Type.Number({
      default: -1,
      description: "Downwelling source amplitude (negative).",
    }),
    smoothingIterations: Type.Integer({
      default: 2,
      minimum: 0,
      maximum: 4,
      description: "Fixed-count Laplacian smoothing iterations applied to the potential.",
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
      description: "Minimum separation scale relative to source radius (Poisson-disk guard).",
    }),
  },
  { additionalProperties: false }
);

export const FoundationMantlePotentialSchema = Type.Object(
  {
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    potential: TypedArraySchemas.f32({
      shape: null,
      description: "Mantle potential per mesh cell (normalized -1..1).",
    }),
    sourceCount: Type.Integer({ minimum: 0, description: "Number of mantle sources." }),
    sourceType: TypedArraySchemas.i8({
      shape: null,
      description: "Source type per source (+1 upwelling, -1 downwelling).",
    }),
    sourceCell: TypedArraySchemas.u32({
      shape: null,
      description: "Source mesh cell index per source.",
    }),
    sourceAmplitude: TypedArraySchemas.f32({
      shape: null,
      description: "Source amplitude per source (signed).",
    }),
    sourceRadius: TypedArraySchemas.f32({
      shape: null,
      description: "Source radius per source (mesh-distance units).",
    }),
  },
  { additionalProperties: false }
);

const ComputeMantlePotentialContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mantle-potential",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic RNG seed (derived in the step; pure data).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({ mantlePotential: FoundationMantlePotentialSchema }, { additionalProperties: false }),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeMantlePotentialContract;
export type ComputeMantlePotentialConfig = Static<typeof StrategySchema>;
export type FoundationMantlePotential = Static<typeof FoundationMantlePotentialSchema>;
