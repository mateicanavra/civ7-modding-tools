import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../model/atoms/plate.schema.js";

const StrategySchema = Type.Object(
  {
    plateCount: Type.Integer({
      default: 8,
      minimum: 2,
      maximum: 256,
      description: "Authored tectonic plate count for the selected map size.",
    }),
    polarCaps: Type.Object(
      {
        capFraction: Type.Number({
          default: 0.1,
          minimum: 0.02,
          maximum: 0.25,
          description:
            "Controls the mesh Y-span fraction reserved as the locked polar cap in each hemisphere.",
        }),
        microplateBandFraction: Type.Number({
          default: 0.2,
          minimum: 0.02,
          maximum: 0.5,
          description:
            "Fraction of mesh Y-span eligible for polar microplate seeding (outside the locked cap).",
        }),
        microplatesPerPole: Type.Integer({
          default: 0,
          minimum: 0,
          maximum: 8,
          description:
            "Maximum polar microplates per pole (subject to plateCount and min-plate guards).",
        }),
        microplatesMinPlateCount: Type.Integer({
          default: 14,
          minimum: 0,
          maximum: 256,
          description:
            "Only enable polar microplates when the normalized plateCount meets this threshold.",
        }),
        microplateMinAreaCells: Type.Integer({
          default: 8,
          minimum: 1,
          maximum: 10_000,
          description: "Minimum cell area for a polar microplate (sliver guardrail).",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Controls polar cap and polar microplate partition behavior for the generated plate graph.",
      }
    ),
  },
  { additionalProperties: false }
);

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
          neighborsOffsets: TypedArraySchemas.i32({ cardinality: null }),
          neighbors: TypedArraySchemas.i32({ cardinality: null }),
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
          cellToPlate: TypedArraySchemas.i16({ cardinality: null }),
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
  strategies: {
    "resistance-weighted-voronoi": StrategySchema,
  },
});

export default ComputePlateGraphContract;
