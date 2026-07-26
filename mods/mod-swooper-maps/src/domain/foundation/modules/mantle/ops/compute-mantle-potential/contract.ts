import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import poissonSourceFieldDefinition from "./strategies/poisson-source-field/config.js";

/**
 * Contract for constructing a deterministic mantle potential field over the Foundation mesh.
 * Its authored source and smoothing controls feed forcing generation without exposing implementation rules.
 */
const ComputeMantlePotentialContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mantle-potential",
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
      mantlePotential: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          cellCount: Type.Integer({ minimum: 1 }),
          potential: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          sourceCount: Type.Integer({ minimum: 0 }),
          sourceType: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
          sourceCell: TypedArraySchemas.u32({ cardinality: "constructor-only" }),
          sourceAmplitude: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          sourceRadius: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
        },
        {
          additionalProperties: false,
          description: "Mantle potential and the signed sources that generated it.",
        }
      ),
    },
    { additionalProperties: false }
  ),
  strategies: [poissonSourceFieldDefinition],
});

export default ComputeMantlePotentialContract;
