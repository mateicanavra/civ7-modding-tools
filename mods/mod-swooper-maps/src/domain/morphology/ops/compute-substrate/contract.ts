import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const SubstrateConfigSchema = Type.Object(
  {
    continentalBaseErodibility: Type.Number({
      description:
        "Controls baseline erodibility for continental crust tiles used by terrain incision.",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    oceanicBaseErodibility: Type.Number({
      description:
        "Controls baseline erodibility for oceanic crust tiles used by terrain incision.",
      default: 0.35,
      minimum: 0,
      maximum: 1,
    }),
    continentalBaseSediment: Type.Number({
      description: "Controls baseline sediment depth proxy for continental crust tiles.",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    oceanicBaseSediment: Type.Number({
      description: "Controls baseline sediment depth proxy for oceanic crust tiles.",
      default: 0.25,
      minimum: 0,
      maximum: 1,
    }),
    ageErodibilityReduction: Type.Number({
      description:
        "Controls how strongly crust age reduces erodibility in terrain substrates (0..1).",
      default: 0.25,
      minimum: 0,
      maximum: 1,
    }),
    ageSedimentBoost: Type.Number({
      description:
        "Controls how strongly crust age raises sediment depth in terrain substrates (0..1).",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    upliftErodibilityBoost: Type.Number({
      description: "Controls uplift-driven erodibility boost for rugged terrain substrates.",
      default: 0.3,
      minimum: 0,
      maximum: 4,
    }),
    riftSedimentBoost: Type.Number({
      description: "Controls rift-driven sediment depth boost for terrain substrates.",
      default: 0.2,
      minimum: 0,
      maximum: 4,
    }),
    convergentBoundaryErodibilityBoost: Type.Number({
      description: "Controls convergent-boundary erodibility boost from boundary closeness (0..1).",
      default: 0.12,
      minimum: 0,
      maximum: 4,
    }),
    divergentBoundaryErodibilityBoost: Type.Number({
      description: "Controls divergent-boundary erodibility boost from boundary closeness (0..1).",
      default: 0.18,
      minimum: 0,
      maximum: 4,
    }),
    transformBoundaryErodibilityBoost: Type.Number({
      description: "Controls transform-boundary erodibility boost from boundary closeness (0..1).",
      default: 0.08,
      minimum: 0,
      maximum: 4,
    }),
    convergentBoundarySedimentBoost: Type.Number({
      description: "Controls convergent-boundary sediment boost from boundary closeness (0..1).",
      default: 0.05,
      minimum: 0,
      maximum: 4,
    }),
    divergentBoundarySedimentBoost: Type.Number({
      description: "Controls divergent-boundary sediment boost from boundary closeness (0..1).",
      default: 0.1,
      minimum: 0,
      maximum: 4,
    }),
    transformBoundarySedimentBoost: Type.Number({
      description: "Controls transform-boundary sediment boost from boundary closeness (0..1).",
      default: 0.03,
      minimum: 0,
      maximum: 4,
    }),
  },
  {
    additionalProperties: false,
    description: "Substrate controls for terrain erodibility and sediment baselines.",
  }
);

/**
 * Computes substrate buffers (erodibility and sediment depth) from tectonic potentials.
 */
const ComputeSubstrateContract = defineOp({
  kind: "compute",
  id: "morphology/compute-substrate",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      upliftPotential: TypedArraySchemas.u8({
        description: "Uplift potential per tile (0..255).",
      }),
      riftPotential: TypedArraySchemas.u8({
        description: "Rift potential per tile (0..255).",
      }),
      boundaryCloseness: TypedArraySchemas.u8({
        description: "Boundary proximity per tile (0..255).",
      }),
      boundaryType: TypedArraySchemas.u8({
        description: "Boundary type per tile (BOUNDARY_TYPE values).",
      }),
      crustType: TypedArraySchemas.u8({
        description: "Crust type per tile (0=oceanic, 1=continental).",
      }),
      crustAge: TypedArraySchemas.u8({
        description: "Crust age per tile (0=new, 255=ancient).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    erodibilityK: TypedArraySchemas.f32({
      description: "Erodibility / resistance proxy per tile (higher = easier incision).",
    }),
    sedimentDepth: TypedArraySchemas.f32({
      description: "Loose sediment thickness proxy per tile (higher = deeper deposits).",
    }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: SubstrateConfigSchema,
  },
});

export default ComputeSubstrateContract;
