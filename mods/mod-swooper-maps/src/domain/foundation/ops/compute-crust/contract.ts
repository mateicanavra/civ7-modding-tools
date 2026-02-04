import { TypedArraySchemas, Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static, TSchema } from "@swooper/mapgen-core/authoring";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";

function withDescription<T extends TSchema>(schema: T, description: string) {
  const { additionalProperties: _additionalProperties, default: _default, ...rest } = schema as any;
  return Type.Unsafe<Static<T>>({ ...rest, description } as any);
}

/** Default strategy configuration for computing basaltic-lid crust truth + derived drivers. */
const StrategySchema = Type.Object(
  {
    /** Basaltic lid thickness proxy (0..1). Controls baseline lithosphere strength and buoyancy. */
    basalticThickness01: Type.Number({
      default: 0.25,
      minimum: 0,
      maximum: 1,
      description: "Basaltic lid thickness proxy (0..1). Controls baseline lithosphere strength and buoyancy.",
    }),
    /** Yield strength scalar for the lithosphere (0..1). */
    yieldStrength01: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description: "Yield strength scalar for the lithosphere (0..1).",
    }),
    /** Mantle coupling scalar (0..1) used to scale initial strength (mantle-coupled baseline). */
    mantleCoupling01: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 1,
      description: "Mantle coupling scalar (0..1) used to scale initial strength (mantle-coupled baseline).",
    }),
    /** Rift weakening scalar (0..1). Reserved for event-driven weakening in later slices. */
    riftWeakening01: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Rift weakening scalar (0..1). Reserved for event-driven weakening in later slices.",
    }),
  },
  { description: "Default strategy configuration for computing basaltic-lid crust truth + derived drivers." }
);

/** Crust truth + derived drivers per mesh cell. */
export const FoundationCrustSchema = Type.Object(
  {
    /** Crust maturity per mesh cell (0=basaltic lid, 1=cratonic). */
    maturity: TypedArraySchemas.f32({
      shape: null,
      description: "Crust maturity per mesh cell (0=basaltic lid, 1=cratonic).",
    }),
    /** Crust thickness proxy per mesh cell (0..1). */
    thickness: TypedArraySchemas.f32({
      shape: null,
      description: "Crust thickness proxy per mesh cell (0..1).",
    }),
    /** Crust thermal age per mesh cell (0..255). */
    thermalAge: TypedArraySchemas.u8({
      shape: null,
      description: "Crust thermal age per mesh cell (0..255).",
    }),
    /** Crust damage per mesh cell (0..255). */
    damage: TypedArraySchemas.u8({
      shape: null,
      description: "Crust damage per mesh cell (0..255).",
    }),
    type: TypedArraySchemas.u8({
      shape: null,
      description: "Crust type per mesh cell (0=oceanic, 1=continental).",
    }),
    age: TypedArraySchemas.u8({
      shape: null,
      description: "Crust thermal age per mesh cell (0=new, 255=ancient).",
    }),
    buoyancy: TypedArraySchemas.f32({
      shape: null,
      description: "Crust buoyancy proxy per mesh cell (0..1).",
    }),
    baseElevation: TypedArraySchemas.f32({
      shape: null,
      description: "Isostatic base elevation proxy per mesh cell (0..1).",
    }),
    strength: TypedArraySchemas.f32({
      shape: null,
      description: "Lithospheric strength proxy per mesh cell (0..1).",
    }),
  },
  { description: "Crust truth + derived drivers per mesh cell." }
);

/** Input payload for foundation/compute-crust. */
const InputSchema = Type.Object(
  {
    /** Foundation mesh (cells, adjacency, site coordinates). */
    mesh: withDescription(
      FoundationMeshSchema,
      "Foundation mesh (cells, adjacency, site coordinates)."
    ),
    /** Deterministic RNG seed (derived in the step; pure data). */
    rngSeed: Type.Integer({
      minimum: 0,
      maximum: 2_147_483_647,
      description: "Deterministic RNG seed (derived in the step; pure data).",
    }),
  },
  { description: "Input payload for foundation/compute-crust." }
);

/** Output payload for foundation/compute-crust. */
const OutputSchema = Type.Object(
  {
    /** Crust truth + derived drivers per mesh cell. */
    crust: FoundationCrustSchema,
  },
  { description: "Output payload for foundation/compute-crust." }
);

const ComputeCrustContract = defineOp({
  kind: "compute",
  id: "foundation/compute-crust",
  input: InputSchema,
  output: OutputSchema,
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeCrustContract;
export type ComputeCrustConfig = Static<typeof StrategySchema>;
export type FoundationCrust = Static<typeof FoundationCrustSchema>;
