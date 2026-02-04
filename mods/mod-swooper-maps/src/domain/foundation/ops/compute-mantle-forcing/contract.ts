import { TypedArraySchemas, Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationMantlePotentialSchema } from "../compute-mantle-potential/contract.js";

const StrategySchema = Type.Object(
  {
    velocityScale: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 5,
      description: "Scale factor applied to -grad(phi) when constructing the forcing velocity field.",
    }),
    rotationScale: Type.Number({
      default: 0.2,
      minimum: 0,
      maximum: 2,
      description: "Scale factor applied to the rot90(grad(phi)) shear component.",
    }),
    stressNorm: Type.Number({
      default: 1,
      minimum: 1e-3,
      maximum: 10,
      description: "Normalization factor for stress proxy (grad + curvature).",
    }),
    curvatureWeight: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 2,
      description: "Weight for curvature (|laplacian|) contribution to stress.",
    }),
    upwellingThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Local-maximum threshold for upwelling classification.",
    }),
    downwellingThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Local-minimum threshold for downwelling classification.",
    }),
  },
  { additionalProperties: false }
);

export const FoundationMantleForcingSchema = Type.Object(
  {
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    stress: TypedArraySchemas.f32({
      shape: null,
      description: "Stress proxy per mesh cell (normalized 0..1).",
    }),
    forcingU: TypedArraySchemas.f32({
      shape: null,
      description: "Forcing velocity X component per mesh cell.",
    }),
    forcingV: TypedArraySchemas.f32({
      shape: null,
      description: "Forcing velocity Y component per mesh cell.",
    }),
    forcingMag: TypedArraySchemas.f32({
      shape: null,
      description: "Forcing magnitude per mesh cell (normalized 0..1).",
    }),
    upwellingClass: TypedArraySchemas.i8({
      shape: null,
      description: "Upwelling classification per mesh cell (+1 upwelling, -1 downwelling, 0 neutral).",
    }),
    divergence: TypedArraySchemas.f32({
      shape: null,
      description: "Divergence per mesh cell (normalized -1..1).",
    }),
  },
  { additionalProperties: false }
);

const ComputeMantleForcingContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mantle-forcing",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      mantlePotential: FoundationMantlePotentialSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object({ mantleForcing: FoundationMantleForcingSchema }, { additionalProperties: false }),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeMantleForcingContract;
export type ComputeMantleForcingConfig = Static<typeof StrategySchema>;
export type FoundationMantleForcing = Static<typeof FoundationMantleForcingSchema>;
