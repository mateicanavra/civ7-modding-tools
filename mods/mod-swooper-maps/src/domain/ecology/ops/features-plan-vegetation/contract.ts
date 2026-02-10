import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";
import { FeaturePlacementSchema } from "../../shared/placement-schema.js";

const PlanVegetationContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-vegetation",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),

    scoreForest01: TypedArraySchemas.f32({ description: "Forest suitability score per tile (0..1)." }),
    scoreRainforest01: TypedArraySchemas.f32({ description: "Rainforest suitability score per tile (0..1)." }),
    scoreTaiga01: TypedArraySchemas.f32({ description: "Taiga suitability score per tile (0..1)." }),
    scoreSavannaWoodland01: TypedArraySchemas.f32({
      description: "Savanna woodland suitability score per tile (0..1).",
    }),
    scoreSagebrushSteppe01: TypedArraySchemas.f32({
      description: "Sagebrush steppe suitability score per tile (0..1).",
    }),

    landMask: TypedArraySchemas.u8({ description: "1 = land, 0 = water." }),

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
      minScore01: Type.Number({
        description: "Minimum suitability score (0..1) required to place the feature.",
        default: 0.15,
        minimum: 0,
        maximum: 1,
      }),
    }),
  },
});

export default PlanVegetationContract;

