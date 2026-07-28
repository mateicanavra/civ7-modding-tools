import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FloodplainFeaturePlacementSchema } from "../../model/atoms/index.js";
import highestConfidenceDefinition from "./strategies/highest-confidence/config.js";

const floodplainScore = (description: string) => TypedArraySchemas.f32({ description });

/** Selects the strongest admitted floodplain family for each unoccupied tile from physical suitability evidence. Every implementation shares this admitted input and output boundary. */
const PlanFloodplainsContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-floodplains",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),

    scoreDesertMinor01: floodplainScore("Desert minor floodplain suitability score per tile."),
    scoreDesertNavigable01: floodplainScore(
      "Desert navigable floodplain suitability score per tile."
    ),
    scoreGrasslandMinor01: floodplainScore(
      "Grassland minor floodplain suitability score per tile."
    ),
    scoreGrasslandNavigable01: floodplainScore(
      "Grassland navigable floodplain suitability score per tile."
    ),
    scorePlainsMinor01: floodplainScore("Plains minor floodplain suitability score per tile."),
    scorePlainsNavigable01: floodplainScore(
      "Plains navigable floodplain suitability score per tile."
    ),
    scoreTropicalMinor01: floodplainScore("Tropical minor floodplain suitability score per tile."),
    scoreTropicalNavigable01: floodplainScore(
      "Tropical navigable floodplain suitability score per tile."
    ),
    scoreTundraMinor01: floodplainScore("Tundra minor floodplain suitability score per tile."),
    scoreTundraNavigable01: floodplainScore(
      "Tundra navigable floodplain suitability score per tile."
    ),

    featureOccupancyMask: TypedArraySchemas.u8({
      description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent.",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(FloodplainFeaturePlacementSchema),
  }),
  strategies: [highestConfidenceDefinition],
});

export default PlanFloodplainsContract;
