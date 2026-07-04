import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as PlateIdByEraSchema } from "../../artifacts/plate-id-by-era.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as FoundationPlateGraphSchema } from "../../artifacts/plate-graph.artifact.js";
import { Schema as FoundationPlateMotionSchema } from "../../artifacts/plate-motion.artifact.js";

const StrategySchema = Type.Object(
  {
    eraWeights: Type.Array(
      Type.Number({
        minimum: 0,
        maximum: 10,
        description:
          "Controls one era's contribution weight when pseudo-evolution history is rolled forward.",
      }),
      {
        default: [0.3, 0.25, 0.2, 0.15, 0.1],
        minItems: 5,
        maxItems: 8,
        description:
          "Controls per-era history weights from oldest to newest; array length determines era count (5..8).",
      }
    ),
    driftStepsByEra: Type.Array(
      Type.Integer({
        minimum: 0,
        maximum: 16,
        description:
          "Controls one era's drift step count when reconstructing plate membership history.",
      }),
      {
        default: [12, 9, 6, 3, 1],
        minItems: 5,
        maxItems: 8,
        description:
          "Controls per-era drift steps from oldest to newest; array length determines era count (5..8).",
      }
    ),
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
