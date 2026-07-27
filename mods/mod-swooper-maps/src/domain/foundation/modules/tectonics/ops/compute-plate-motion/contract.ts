import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";
import rigidBodyFitDefinition from "./strategies/rigid-body-fit/config.js";

/**
 * Contract for fitting rigid translation and rotation to each plate from mantle forcing.
 * Fit-quality evidence travels with motion because boundary classification depends on both.
 */
const ComputePlateMotionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plate-motion",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          areas: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
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
      mantleForcing: Type.Object(
        {
          forcingU: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          forcingV: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      plateMotion: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          cellCount: Type.Integer({ minimum: 1 }),
          plateCount: Type.Integer({ minimum: 1 }),
          plateCenterX: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateCenterY: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateVelocityX: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateVelocityY: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateOmega: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateFitRms: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateFitP90: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          plateQuality: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          cellFitError: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Rigid per-plate translation and rotation fitted to mantle forcing, plus fit-quality evidence; motion drives boundary classification and era membership reconstruction.",
    }
  ),
  strategies: [rigidBodyFitDefinition],
});

export default ComputePlateMotionContract;
