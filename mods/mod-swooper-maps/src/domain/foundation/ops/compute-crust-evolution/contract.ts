import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import {
  FoundationTectonicHistorySchema,
  FoundationTectonicProvenanceSchema,
  FoundationTectonicsSchema,
} from "../compute-tectonic-history/contract.js";

const StrategySchema = Type.Object(
  {
    /** How strongly accumulated uplift contributes to crust maturity (0..2). */
    upliftToMaturity: Type.Number({
      minimum: 0,
      maximum: 2,
      default: 1.0,
      description: "How strongly accumulated uplift contributes to crust maturity (0..2).",
    }),
    /** How strongly provenance “material age” contributes to maturity (0..2). */
    ageToMaturity: Type.Number({
      minimum: 0,
      maximum: 2,
      // Provenance "material age" is an important stability/strength signal, but it should not
      // dominate continental emergence (oceanic crust does not become continental simply by aging).
      default: 0.25,
      description: "How strongly provenance “material age” contributes to maturity (0..2).",
    }),
    /** How strongly rift/fracture signals suppress maturity (0..2). */
    disruptionToMaturity: Type.Number({
      minimum: 0,
      maximum: 2,
      default: 0.9,
      description: "How strongly rift/fracture signals suppress maturity (0..2).",
    }),
  },
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
      tectonicProvenance: FoundationTectonicProvenanceSchema,
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
