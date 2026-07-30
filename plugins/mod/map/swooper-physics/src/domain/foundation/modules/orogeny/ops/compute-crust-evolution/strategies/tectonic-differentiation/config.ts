import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for tectonic crust differentiation.
 * Crust-evolution input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "tectonic-differentiation",
  config: Type.Object(
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
        "Per-map-class character controls for tectonic crust differentiation: abundance, freeboard, fragmentation, shelf depth, and abyssal relief. Defaults form the Earthlike profile.",
    }
  ),
});
