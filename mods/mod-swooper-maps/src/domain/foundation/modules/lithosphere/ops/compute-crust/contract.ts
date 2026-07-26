import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import basalticLidDefinition from "./strategies/basaltic-lid/config.js";

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
  strategies: [basalticLidDefinition],
});

export default ComputeCrustContract;
