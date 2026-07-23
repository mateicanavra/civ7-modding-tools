import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";
import relativeMotionRegimesDefinition from "./strategies/relative-motion-regimes/config.js";

/**
 * Contract for classifying the plate graph's boundary edges from relative plate motion.
 * The canonical segment table becomes the shared source for event generation and current state.
 */
const ComputeTectonicSegmentsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-segments",
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
          strength: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          type: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
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
          cellCount: Type.Integer({ minimum: 1 }),
          plateCount: Type.Integer({ minimum: 1 }),
          plateCenterX: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateCenterY: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateVelocityX: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateVelocityY: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
          plateOmega: TypedArraySchemas.f32({ cardinality: ["plateMotion.plateCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      segments: Type.Object(
        {
          segmentCount: Type.Integer({ minimum: 0 }),
          aCell: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
          bCell: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
          plateA: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
          plateB: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
          regime: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          polarity: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
          compression: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          extension: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          shear: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          volcanism: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          fracture: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          driftU: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
          driftV: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Canonical plate-boundary table with aligned cell and plate endpoints, classified regime and polarity, event intensities, and drift for each segment.",
    }
  ),
  strategies: [relativeMotionRegimesDefinition],
});

export default ComputeTectonicSegmentsContract;
