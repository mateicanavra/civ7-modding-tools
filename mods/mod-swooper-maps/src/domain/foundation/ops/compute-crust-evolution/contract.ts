import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationTectonicHistorySchema, FoundationTectonicsSchema } from "../../lib/tectonics/schemas.js";

const StrategySchema = Type.Object(
  {},
  { additionalProperties: false, description: "Default strategy parameters for crust evolution from tectonic history." }
);

const ComputeCrustEvolutionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-crust-evolution",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      crustInit: FoundationCrustSchema,
      tectonics: FoundationTectonicsSchema,
      tectonicHistory: FoundationTectonicHistorySchema,
    },
    { additionalProperties: false, description: "Input payload for foundation/compute-crust-evolution." }
  ),
  output: Type.Object(
    {
      crust: FoundationCrustSchema,
    },
    { additionalProperties: false, description: "Output payload for foundation/compute-crust-evolution." }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeCrustEvolutionContract;
export type ComputeCrustEvolutionConfig = Static<typeof StrategySchema>;
