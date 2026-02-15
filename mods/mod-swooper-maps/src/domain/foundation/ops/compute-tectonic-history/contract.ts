import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationMantleForcingSchema } from "../compute-mantle-forcing/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationPlateGraphSchema } from "../compute-plate-graph/contract.js";
import { FoundationPlateMotionSchema } from "../compute-plate-motion/contract.js";
import {
  FoundationTectonicHistorySchema,
  FoundationTectonicProvenanceSchema,
  FoundationTectonicsSchema,
} from "../../lib/tectonics/schemas.js";

const StrategySchema = Type.Object(
  {
    eraWeights: Type.Array(Type.Number({ minimum: 0, maximum: 10 }), {
      default: [0.3, 0.25, 0.2, 0.15, 0.1],
      minItems: 5,
      maxItems: 8,
      description: "Per-era weight multipliers (oldest→newest). Array length defines eraCount (5..8).",
    }),
    driftStepsByEra: Type.Array(Type.Integer({ minimum: 0, maximum: 16 }), {
      default: [12, 9, 6, 3, 1],
      minItems: 5,
      maxItems: 8,
      description:
        "How many discrete neighbor steps to drift segment seeds per era (oldest→newest). Array length defines eraCount (5..8).",
    }),
    beltInfluenceDistance: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description: "Base belt influence distance in mesh-neighbor steps (effective radii may be scaled per channel).",
    }),
    beltDecay: Type.Number({
      default: 0.55,
      minimum: 0.01,
      maximum: 10,
      description: "Exponential decay coefficient for belt influence per mesh-neighbor step.",
    }),
    activityThreshold: Type.Integer({
      default: 1,
      minimum: 0,
      maximum: 255,
      description: "Threshold used to compute lastActiveEra (0..255).",
    }),
  },
  { additionalProperties: false }
);

const ComputeTectonicHistoryContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-history",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      crust: FoundationCrustSchema,
      mantleForcing: FoundationMantleForcingSchema,
      plateGraph: FoundationPlateGraphSchema,
      plateMotion: FoundationPlateMotionSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicHistory: FoundationTectonicHistorySchema,
      tectonics: FoundationTectonicsSchema,
      tectonicProvenance: FoundationTectonicProvenanceSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeTectonicHistoryContract;
export type ComputeTectonicHistoryConfig = Static<typeof StrategySchema>;
export {
  FoundationTectonicHistorySchema,
  FoundationTectonicProvenanceSchema,
  FoundationTectonicsSchema,
} from "../../lib/tectonics/schemas.js";
export type {
  FoundationTectonicHistory,
  FoundationTectonicProvenance,
  FoundationTectonics,
} from "../../lib/tectonics/schemas.js";
