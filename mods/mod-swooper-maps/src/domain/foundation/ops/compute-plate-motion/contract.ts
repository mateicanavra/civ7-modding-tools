import { TypedArraySchemas, Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationMantleForcingSchema } from "../compute-mantle-forcing/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationPlateGraphSchema } from "../compute-plate-graph/contract.js";

const StrategySchema = Type.Object(
  {
    omegaFactor: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 10,
      description: "Scale factor applied to mantle mean speed when clamping angular velocity.",
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
      description: "Scale factor applied to mean forcing speed when normalizing residual diagnostics.",
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
      description: "Fixed count of smoothing passes applied to the forcing field before fitting (0 or 1).",
    }),
  },
  { additionalProperties: false }
);

export const FoundationPlateMotionSchema = Type.Object(
  {
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    plateCount: Type.Integer({ minimum: 1, description: "Number of plates." }),
    plateCenterX: TypedArraySchemas.f32({
      shape: null,
      description: "Plate rotation center X coordinate per plate (mesh space, unwrapped).",
    }),
    plateCenterY: TypedArraySchemas.f32({
      shape: null,
      description: "Plate rotation center Y coordinate per plate (mesh space, unwrapped).",
    }),
    plateVelocityX: TypedArraySchemas.f32({
      shape: null,
      description: "Plate translation X component per plate.",
    }),
    plateVelocityY: TypedArraySchemas.f32({
      shape: null,
      description: "Plate translation Y component per plate.",
    }),
    plateOmega: TypedArraySchemas.f32({
      shape: null,
      description: "Plate angular velocity per plate.",
    }),
    plateFitRms: TypedArraySchemas.f32({
      shape: null,
      description: "RMS fit error per plate (mesh-space residual magnitude).",
    }),
    plateFitP90: TypedArraySchemas.f32({
      shape: null,
      description: "P90 fit error per plate (mesh-space residual magnitude).",
    }),
    plateQuality: TypedArraySchemas.u8({
      shape: null,
      description: "Plate fit quality scalar per plate (0..255).",
    }),
    cellFitError: TypedArraySchemas.u8({
      shape: null,
      description: "Per-cell fit residual (normalized 0..255).",
    }),
  },
  { additionalProperties: false }
);

const ComputePlateMotionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plate-motion",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      plateGraph: FoundationPlateGraphSchema,
      mantleForcing: FoundationMantleForcingSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object({ plateMotion: FoundationPlateMotionSchema }, { additionalProperties: false }),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputePlateMotionContract;
export type ComputePlateMotionConfig = Static<typeof StrategySchema>;
export type FoundationPlateMotion = Static<typeof FoundationPlateMotionSchema>;
