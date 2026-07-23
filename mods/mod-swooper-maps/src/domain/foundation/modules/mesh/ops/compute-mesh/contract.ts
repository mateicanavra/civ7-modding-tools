import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { MeshBoundingBoxSchema } from "../../model/atoms/bounding-box.schema.js";

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
  strategies: {
    "jittered-delaunay": Type.Object(
      {
        plateCount: Type.Integer({
          default: 8,
          minimum: 2,
          maximum: 256,
          description:
            "Controls the target tectonic plate count used to derive mesh cell density for this map.",
        }),
        cellsPerPlate: Type.Integer({
          default: 2,
          minimum: 1,
          maximum: 32,
          description:
            "Controls mesh resolution by setting how many mesh cells are generated per normalized plate.",
        }),
        relaxationSteps: Type.Integer({
          default: 2,
          minimum: 0,
          maximum: 50,
          description:
            "Controls how many relaxation passes smooth generated mesh sites before downstream plate logic runs.",
        }),
      },
      { additionalProperties: false }
    ),
  },
});

export default ComputeMeshContract;
