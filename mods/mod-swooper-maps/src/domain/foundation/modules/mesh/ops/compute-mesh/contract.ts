import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { MeshBoundingBoxSchema } from "../../model/atoms/bounding-box.schema.js";
import strategies from "./strategies/contract.js";

/**
 * Contract for producing the shared Foundation point mesh from map dimensions and seed.
 * Every later subdomain consumes this topology, so alternate strategies must preserve its artifact shape.
 */
const ComputeMeshContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mesh",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
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
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          siteY: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          neighborsOffsets: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
          areas: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          bbox: MeshBoundingBoxSchema,
        },
        {
          additionalProperties: false,
          description: "Generated wrapped neighborhood mesh and its cell geometry.",
        }
      ),
    },
    { additionalProperties: false }
  ),
  strategies,
});

export default ComputeMeshContract;
