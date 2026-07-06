import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationCrustSchema } from "../../artifacts/crust.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as FoundationPlateGraphSchema } from "../../artifacts/plate-graph.artifact.js";
import { Schema as FoundationPlateMotionSchema } from "../../artifacts/plate-motion.artifact.js";
import { Schema as FoundationTectonicSegmentsSchema } from "../../artifacts/tectonic-segments.artifact.js";

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

const ComputeTectonicSegmentsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-segments",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      crust: FoundationCrustSchema,
      plateGraph: FoundationPlateGraphSchema,
      plateMotion: FoundationPlateMotionSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    { segments: FoundationTectonicSegmentsSchema },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeTectonicSegmentsContract;
export type ComputeTectonicSegmentsConfig = Static<typeof StrategySchema>;
