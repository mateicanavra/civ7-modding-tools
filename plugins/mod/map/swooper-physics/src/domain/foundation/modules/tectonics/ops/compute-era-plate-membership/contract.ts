import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";
import { PlateMembershipSchema } from "../../model/atoms/plate-membership.schema.js";
import backwardDriftDefinition from "./strategies/backward-drift/config.js";

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
          neighborsOffsets: TypedArraySchemas.i32({
            cardinality: { factors: ["mesh.cellCount"], addend: 1 },
          }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
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
  strategies: [backwardDriftDefinition],
});

export default ComputeEraPlateMembershipContract;
