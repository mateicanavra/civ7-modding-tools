import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../shared/placement-schema.js";

const floodplainScore = (description: string) => TypedArraySchemas.f32({ description });

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

    featureIndex: TypedArraySchemas.u16({
      description: "0 = unoccupied, otherwise 1 + FEATURE_KEY_INDEX",
    }),
    reserved: TypedArraySchemas.u8({
      description: "0 = tile can be claimed, 1 = permanently blocked",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(FeaturePlacementSchema),
  }),
  strategies: {
    default: Type.Object({
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.5,
        description:
          "Minimum floodplain suitability required to author a floodplain feature intent.",
      }),
    }),
  },
});

export default PlanFloodplainsContract;
