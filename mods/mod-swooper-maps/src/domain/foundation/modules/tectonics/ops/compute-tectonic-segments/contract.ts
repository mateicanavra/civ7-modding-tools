import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";

const StrategySchema = Type.Object(
  {
    intensityScale: Type.Number({
      default: 900,
      minimum: 1,
      maximum: 10_000,
      description:
        "Controls how strongly relative plate motion maps into 0..255 boundary segment intensities.",
    }),
    regimeMinIntensity: Type.Integer({
      default: 4,
      minimum: 0,
      maximum: 255,
      description:
        "Sets the minimum boundary intensity required before a segment affects tectonic regime classification.",
    }),
  },
  { additionalProperties: false }
);

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
          neighborsOffsets: TypedArraySchemas.i32({ cardinality: null }),
          neighbors: TypedArraySchemas.i32({ cardinality: null }),
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
          aCell: TypedArraySchemas.i32({ cardinality: null }),
          bCell: TypedArraySchemas.i32({ cardinality: null }),
          plateA: TypedArraySchemas.i16({ cardinality: null }),
          plateB: TypedArraySchemas.i16({ cardinality: null }),
          regime: TypedArraySchemas.u8({ cardinality: null }),
          polarity: TypedArraySchemas.i8({ cardinality: null }),
          compression: TypedArraySchemas.u8({ cardinality: null }),
          extension: TypedArraySchemas.u8({ cardinality: null }),
          shear: TypedArraySchemas.u8({ cardinality: null }),
          volcanism: TypedArraySchemas.u8({ cardinality: null }),
          fracture: TypedArraySchemas.u8({ cardinality: null }),
          driftU: TypedArraySchemas.i8({ cardinality: null }),
          driftV: TypedArraySchemas.i8({ cardinality: null }),
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
  strategies: {
    "relative-motion-regimes": StrategySchema,
  },
});

export default ComputeTectonicSegmentsContract;
