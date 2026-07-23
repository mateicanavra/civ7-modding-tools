import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";
import { PlateMembershipSchema } from "../../model/atoms/plate-membership.schema.js";

const StrategySchema = Type.Object(
  {
    eraWeights: Type.Array(
      Type.Number({
        minimum: 0,
        maximum: 10,
        description:
          "Controls one era's contribution weight when pseudo-evolution history is rolled forward.",
      }),
      {
        default: [0.3, 0.25, 0.2, 0.15, 0.1],
        minItems: 5,
        maxItems: 8,
        description:
          "Controls per-era history weights from oldest to newest; array length determines era count (5..8).",
      }
    ),
    driftStepsByEra: Type.Array(
      Type.Integer({
        minimum: 0,
        maximum: 16,
        description:
          "Controls one era's drift step count when reconstructing plate membership history.",
      }),
      {
        default: [12, 9, 6, 3, 1],
        minItems: 5,
        maxItems: 8,
        description:
          "Controls per-era drift steps from oldest to newest; array length determines era count (5..8).",
      }
    ),
  },
  { additionalProperties: false }
);

/**
 * Contract for reconstructing each mesh cell's plate membership across tectonic eras.
 * The strategy is swappable behind the tectonics router while preserving the era-indexed atom shape.
 */
const ComputeEraPlateMembershipContract = defineOp({
  kind: "compute",
  id: "foundation/compute-era-plate-membership",
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
      plateGraph: Type.Object(
        {
          cellToPlate: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }),
          plates: Type.Immutable(Type.Array(PlateSchema)),
        },
        { additionalProperties: false }
      ),
      plateMotion: Type.Object(
        {
          plateCount: Type.Integer({ minimum: 1 }),
          plateVelocityX: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateVelocityY: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
      eraWeights: Type.Array(Type.Number()),
      plateIdByEra: Type.Array(PlateMembershipSchema, { minItems: 1 }),
    },
    {
      additionalProperties: false,
      description:
        "Oldest-to-newest pseudo-history schedule: each weighted era carries one mesh-wide cell-to-plate assignment used to reconstruct tectonic events.",
    }
  ),
  strategies: {
    "backward-drift": StrategySchema,
  },
});

export default ComputeEraPlateMembershipContract;
