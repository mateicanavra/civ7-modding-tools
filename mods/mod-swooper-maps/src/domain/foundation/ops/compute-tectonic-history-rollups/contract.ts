import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationTectonicHistorySchema } from "../compute-tectonic-history/contract.js";
import {
  FoundationTectonicEraFieldsInternalListSchema,
  PlateIdByEraSchema,
} from "../compute-tectonic-history/lib/internal-contract.js";

const StrategySchema = Type.Object(
  {
    activityThreshold: Type.Integer({
      default: 1,
      minimum: 0,
      maximum: 255,
      description: "Threshold used to compute lastActiveEra (0..255).",
    }),
  },
  { additionalProperties: false }
);

const ComputeTectonicHistoryRollupsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-history-rollups",
  input: Type.Object(
    {
      eras: FoundationTectonicEraFieldsInternalListSchema,
      plateIdByEra: PlateIdByEraSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicHistory: FoundationTectonicHistorySchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeTectonicHistoryRollupsContract;
export type ComputeTectonicHistoryRollupsConfig = Static<typeof StrategySchema>;
