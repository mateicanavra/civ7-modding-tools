import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationPlateGraphSchema } from "../compute-plate-graph/contract.js";
import { FoundationPlateMotionSchema } from "../compute-plate-motion/contract.js";
import { PlateIdByEraSchema } from "../../lib/tectonics/internal-contract.js";

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
      description: "Per-era drift steps (oldest→newest). Array length defines eraCount (5..8).",
    }),
  },
  { additionalProperties: false }
);

const ComputeEraPlateMembershipContract = defineOp({
  kind: "compute",
  id: "foundation/compute-era-plate-membership",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      plateGraph: FoundationPlateGraphSchema,
      plateMotion: FoundationPlateMotionSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
      eraWeights: Type.Array(Type.Number()),
      plateIdByEra: PlateIdByEraSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeEraPlateMembershipContract;
export type ComputeEraPlateMembershipConfig = Static<typeof StrategySchema>;
