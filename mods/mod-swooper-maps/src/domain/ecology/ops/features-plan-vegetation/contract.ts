import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";
import { FeaturePlacementSchema } from "../../shared/placement-schema.js";

const PlanVegetationContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-vegetation",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),

    scoreForest01: TypedArraySchemas.f32({
      description: "Forest suitability score per tile (0..1).",
    }),
    scoreRainforest01: TypedArraySchemas.f32({
      description: "Rainforest suitability score per tile (0..1).",
    }),
    scoreTaiga01: TypedArraySchemas.f32({
      description: "Taiga suitability score per tile (0..1).",
    }),
    scoreSavannaWoodland01: TypedArraySchemas.f32({
      description: "Savanna woodland suitability score per tile (0..1).",
    }),
    scoreSagebrushSteppe01: TypedArraySchemas.f32({
      description: "Sagebrush steppe suitability score per tile (0..1).",
    }),

    landMask: TypedArraySchemas.u8({ description: "1 = land, 0 = water." }),
    flatLandMask: TypedArraySchemas.u8({
      description:
        "1 = land tile that will remain flat after terrain projection; 0 = water, hill, mountain, volcano, or lake.",
    }),
    biomeIndex: TypedArraySchemas.u8({
      description:
        "Internal biome classification index used to keep vegetation intents on engine-compatible biome bindings.",
    }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Surface temperature per tile (C) used for broad feature habitat admission.",
    }),
    effectiveMoisture: TypedArraySchemas.f32({
      description: "Effective moisture per tile used for broad feature habitat admission.",
    }),
    aridityIndex: TypedArraySchemas.f32({
      description: "Aridity index per tile (0..1) used for broad feature habitat admission.",
    }),
    vegetationDensity: TypedArraySchemas.f32({
      description: "Vegetation density per tile (0..1) used for broad feature habitat admission.",
    }),

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
      forestMinConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.16,
        description:
          "Forest admission threshold: lower-scoring temperate canopy signal remains biome cover, not feature intent.",
      }),
      rainforestMinConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.22,
        description:
          "Rainforest admission threshold: keeps tropical closed-canopy intent from absorbing all warm wet land.",
      }),
      taigaMinConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.12,
        description:
          "Taiga admission threshold: cold forest scores are lower-amplitude because cold stress is part of the habitat.",
      }),
      savannaWoodlandMinConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.1,
        description:
          "Savanna woodland admission threshold: warm seasonal woodland is patchier than closed forest.",
      }),
      sagebrushSteppeMinConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.08,
        description:
          "Sagebrush steppe admission threshold: semiarid open-cover scores are intentionally sparse and lower-amplitude.",
      }),
    }),
  },
});

export default PlanVegetationContract;
