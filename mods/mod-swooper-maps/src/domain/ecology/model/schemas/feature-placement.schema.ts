import { Type } from "@swooper/mapgen-core/authoring/contracts";

export const FEATURE_INTENT_KEYS = [
  "forest",
  "rainforest",
  "taiga",
  "savanna-woodland",
  "sagebrush-steppe",
  "marsh",
  "tundra-bog",
  "mangrove",
  "oasis",
  "watering-hole",
  "reef",
  "cold-reef",
  "atoll",
  "lotus",
  "ice",
  "desert-floodplain-minor",
  "desert-floodplain-navigable",
  "grassland-floodplain-minor",
  "grassland-floodplain-navigable",
  "plains-floodplain-minor",
  "plains-floodplain-navigable",
  "tropical-floodplain-minor",
  "tropical-floodplain-navigable",
  "tundra-floodplain-minor",
  "tundra-floodplain-navigable",
] as const;

export type FeatureIntentKey = (typeof FEATURE_INTENT_KEYS)[number];

export const FeatureIntentKeySchema = Type.Unsafe<FeatureIntentKey>(
  Type.String({
    description:
      "Abstract ecology feature intent. Civ7 engine feature keys are chosen by projection.",
    enum: [...FEATURE_INTENT_KEYS],
  })
);

export const FeaturePlacementSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    feature: FeatureIntentKeySchema,
    weight: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  },
  { additionalProperties: false }
);
