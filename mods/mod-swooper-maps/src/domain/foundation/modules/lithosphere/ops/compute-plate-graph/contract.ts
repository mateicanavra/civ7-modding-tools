import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../model/atoms/plate.schema.js";
import resistanceWeightedVoronoiDefinition from "./strategies/resistance-weighted-voronoi/config.js";

/**
 * Contract for partitioning the Foundation mesh into stable tectonic plate identities.
 * Its strategy surface lets the lithosphere router swap partition policies without changing consumers.
 */
const ComputePlateGraphContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plate-graph",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          neighborsOffsets: TypedArraySchemas.i32({
            cardinality: { factors: ["mesh.cellCount"], addend: 1 },
          }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
      crust: Type.Object(
        {
          maturity: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          strength: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
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
      plateGraph: Type.Object(
        {
          cellToPlate: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
          plates: Type.Immutable(Type.Array(PlateSchema)),
        },
        {
          additionalProperties: false,
          description: "Mesh-cell plate membership and index-aligned plate identities.",
        }
      ),
    },
    { additionalProperties: false }
  ),
  strategies: [resistanceWeightedVoronoiDefinition],
});

export default ComputePlateGraphContract;
