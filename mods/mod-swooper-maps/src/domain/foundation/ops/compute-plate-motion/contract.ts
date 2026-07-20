import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import { Schema as FoundationMantleForcingSchema } from "../../artifacts/mantle-forcing.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as FoundationPlateGraphSchema } from "../../artifacts/plate-graph.artifact.js";
import { Schema as FoundationPlateMotionSchema } from "../../artifacts/plate-motion.artifact.js";

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
  output: Type.Object(
    { plateMotion: FoundationPlateMotionSchema },
    {
      additionalProperties: false,
      description:
        "Rigid per-plate translation and rotation fitted to mantle forcing, plus fit-quality evidence; motion drives boundary classification and era membership reconstruction.",
    }
  ),
  defaultStrategy: "default",
  strategies: {
    default: StrategySchema,
  },
});

export default ComputePlateMotionContract;
export type ComputePlateMotionConfig = Static<typeof StrategySchema>;
