import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationTectonicHistorySchema } from "../../lib/tectonics/schemas.js";
import {
  FoundationTectonicEraFieldsInternalListSchema,
  PlateIdByEraSchema,
} from "../../lib/tectonics/internal-contract.js";

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
