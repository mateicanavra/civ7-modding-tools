import type { Static } from "@swooper/mapgen-core/authoring";
import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";
import { FoundationMantlePotentialSchema } from "../compute-mantle-potential/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";

const StrategySchema = Type.Object(
  {
    velocityScale: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 5,
      description:
        "Controls the velocity strength applied to mantle-gradient forcing before plate motion fitting.",
    }),
    rotationScale: Type.Number({
      default: 0.2,
      minimum: 0,
      maximum: 2,
      description:
        "Controls the rotational shear component mixed into the mantle forcing velocity field.",
    }),
    stressNorm: Type.Number({
      default: 1,
      minimum: 1e-3,
      maximum: 10,
      description:
        "Sets the normalization factor for stress proxy values consumed by crust and tectonics.",
    }),
    curvatureWeight: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 2,
      description: "Controls how much curvature contributes to the mantle stress proxy.",
    }),
    upwellingThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Sets the local-maximum threshold used to classify cells as upwelling sources.",
    }),
    downwellingThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Sets the local-minimum threshold used to classify cells as downwelling sinks.",
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
      description:
        "Upwelling classification per mesh cell (+1 upwelling, -1 downwelling, 0 neutral).",
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
  output: Type.Object(
    { mantleForcing: FoundationMantleForcingSchema },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeMantleForcingContract;
export type ComputeMantleForcingConfig = Static<typeof StrategySchema>;
export type FoundationMantleForcing = Static<typeof FoundationMantleForcingSchema>;
