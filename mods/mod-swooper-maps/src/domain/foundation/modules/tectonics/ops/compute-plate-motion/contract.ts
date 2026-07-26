import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../../../lithosphere/model/atoms/plate.schema.js";

const StrategySchema = Type.Object(
  {
    omegaFactor: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 10,
      description: "Controls how mantle mean speed scales fitted plate angular velocity.",
    }),
    plateRadiusMin: Type.Number({
      default: 1,
      minimum: 1e-3,
      maximum: 1e6,
      description: "Minimum plate radius (mesh units) used when clamping angular velocity.",
    }),
    residualNormScale: Type.Number({
      default: 1,
      minimum: 0.01,
      maximum: 10,
      description:
        "Controls mean-forcing normalization for residual diagnostics used to judge plate motion fit.",
    }),
    p90NormScale: Type.Number({
      default: 1,
      minimum: 0.01,
      maximum: 10,
      description: "Scale factor applied to mean forcing speed when normalizing plate quality.",
    }),
    histogramBins: Type.Integer({
      default: 32,
      minimum: 8,
      maximum: 128,
      description: "Number of histogram buckets used for per-plate P90 residual estimation.",
    }),
    smoothingSteps: Type.Integer({
      default: 0,
      minimum: 0,
      maximum: 1,
      description:
        "Controls whether one smoothing pass is applied to the forcing field before plate motion fitting.",
    }),
  },
  { additionalProperties: false }
);

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
      mantleForcing: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
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
          plateCenterX: TypedArraySchemas.f32({ cardinality: null }),
          plateCenterY: TypedArraySchemas.f32({ cardinality: null }),
          plateVelocityX: TypedArraySchemas.f32({ cardinality: null }),
          plateVelocityY: TypedArraySchemas.f32({ cardinality: null }),
          plateOmega: TypedArraySchemas.f32({ cardinality: null }),
          plateFitRms: TypedArraySchemas.f32({ cardinality: null }),
          plateFitP90: TypedArraySchemas.f32({ cardinality: null }),
          plateQuality: TypedArraySchemas.u8({ cardinality: null }),
          cellFitError: TypedArraySchemas.u8({ cardinality: null }),
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
  strategies: {
    "rigid-body-fit": StrategySchema,
  },
});

export default ComputePlateMotionContract;
