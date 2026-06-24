import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  FoundationTectonicHistorySchema,
  FoundationTectonicsSchema,
} from "../../lib/tectonics/schemas.js";
import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { CrustEvolutionConfigSchema } from "./config.js";

// Per-map-class character knobs (abundance, freeboard, fragmentation, shelf depth); see ./config.ts.
const StrategySchema = CrustEvolutionConfigSchema;

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
    {
      additionalProperties: false,
      description: "Input payload for foundation/compute-crust-evolution.",
    }
  ),
  output: Type.Object(
    {
      crust: FoundationCrustSchema,
    },
    {
      additionalProperties: false,
      description: "Output payload for foundation/compute-crust-evolution.",
    }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeCrustEvolutionContract;
export type ComputeCrustEvolutionConfig = Static<typeof StrategySchema>;
