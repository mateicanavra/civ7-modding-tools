import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationCrustSchema } from "../../artifacts/crust.artifact.js";
import { Schema as FoundationTectonicsSchema } from "../../artifacts/current-tectonics.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as FoundationTectonicHistorySchema } from "../../artifacts/tectonic-history.artifact.js";

const CrustEvolutionConfigSchema = Type.Object(
  {
    continentalSurvivalMaturity: Type.Number({
      description:
        "Maturity below which marginal continental crust founders to oceanic. Higher = less land (archipelago); lower = more land (pangaea).",
      default: 0.6,
      minimum: 0.4,
      maximum: 0.85,
    }),
    continentalFreeboard: Type.Number({
      description:
        "Isostatic freeboard step of differentiated continental crust. Higher = high-standing continents / narrow deep shelves; lower = low continents / broad shelves.",
      default: 0.35,
      minimum: 0,
      maximum: 0.6,
    }),
    hyperextensionBreakupBase: Type.Number({
      description:
        "Breakup threshold for marginal continental crust. Lower = more rifting/fragmentation; higher = coherent continents.",
      default: 0.1,
      minimum: 0.02,
      maximum: 0.5,
    }),
    thinningThicknessLoss: Type.Number({
      description:
        "Thickness lost by a fully beta-thinned margin (shelf depth). Higher = deeper shelves/basins; lower = shallow shelves.",
      default: 0.55,
      minimum: 0,
      maximum: 1,
    }),
    oceanicAbyssalDepth: Type.Number({
      description:
        "Abyssal subsidence of oceanic floor with distance from the continental margin (deep-ocean relief). Higher = deeper, more dominant open ocean / thinner shelf fringe; 0 = flat floor (shelf-heavy).",
      default: 0.75,
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Per-map-class character knobs for foundation/compute-crust-evolution (abundance, freeboard, fragmentation, shelf depth, abyssal relief). Defaults are the earthlike profile.",
  }
);

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
  defaultStrategy: "default",
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeCrustEvolutionContract;
export type ComputeCrustEvolutionConfig = Static<typeof StrategySchema>;
