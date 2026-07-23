import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** BasalticLid strategy configuration for computing basaltic-lid crust truth + derived drivers. */
const StrategySchema = Type.Object(
  {
    /** Basaltic lid thickness proxy (0..1). Controls baseline lithosphere strength and buoyancy. */
    basalticThickness01: Type.Number({
      default: 0.25,
      minimum: 0,
      maximum: 1,
      description:
        "Basaltic lid thickness proxy (0..1). Controls baseline lithosphere strength and buoyancy.",
    }),
    /** Yield strength scalar for the lithosphere (0..1). */
    yieldStrength01: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description:
        "Controls lithosphere yield strength before mantle coupling and rift weakening are applied.",
    }),
    /** Mantle coupling scalar (0..1) used to scale initial strength (mantle-coupled baseline). */
    mantleCoupling01: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 1,
      description:
        "Mantle coupling scalar (0..1) used to scale initial strength (mantle-coupled baseline).",
    }),
    /** Rift weakening scalar (0..1). Reserved for event-driven weakening in later slices. */
    riftWeakening01: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Controls how strongly rift contexts weaken crust strength in downstream tectonic shaping.",
    }),
  },
  {
    description:
      "BasalticLid strategy configuration for computing basaltic-lid crust truth + derived drivers.",
  }
);

/**
 * Contract for initializing the lithosphere's basaltic crust state from the mesh and mantle forcing.
 * The lithosphere router binds its semantic strategy while recipe steps author only admitted config.
 */
const ComputeCrustContract = defineOp({
  kind: "compute",
  id: "foundation/compute-crust",
  input: Type.Object(
    {
      mesh: Type.Object(
        { cellCount: Type.Integer({ minimum: 1 }) },
        { additionalProperties: false }
      ),
      mantleForcing: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          divergence: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          forcingMag: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          stress: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      crust: Type.Object(
        {
          maturity: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          thickness: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          thermalAge: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          damage: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          type: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          age: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          buoyancy: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          baseElevation: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          strength: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
        },
        {
          additionalProperties: false,
          description: "Initial basaltic crust fields by mesh cell.",
        }
      ),
    },
    { additionalProperties: false }
  ),
  strategies: {
    "basaltic-lid": StrategySchema,
  },
});

export default ComputeCrustContract;
