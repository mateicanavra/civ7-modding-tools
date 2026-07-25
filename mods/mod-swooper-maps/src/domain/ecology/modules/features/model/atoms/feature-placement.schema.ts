import { type Static, type TSchema, Type } from "@swooper/mapgen-core/authoring/schema";

const VEGETATION_FEATURE_INTENT_KEYS = [
  "forest",
  "rainforest",
  "taiga",
  "savanna-woodland",
  "sagebrush-steppe",
] as const;

const WETLAND_FEATURE_INTENT_KEYS = [
  "marsh",
  "tundra-bog",
  "mangrove",
  "oasis",
  "watering-hole",
] as const;

const REEF_FEATURE_INTENT_KEYS = ["reef", "cold-reef", "atoll", "lotus"] as const;
const ICE_FEATURE_INTENT_KEYS = ["ice"] as const;

const FLOODPLAIN_FEATURE_INTENT_KEYS = [
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

/** Semantic feature intents that Ecology planners may claim before engine projection. */
export const FEATURE_INTENT_KEYS = [
  ...VEGETATION_FEATURE_INTENT_KEYS,
  ...WETLAND_FEATURE_INTENT_KEYS,
  ...REEF_FEATURE_INTENT_KEYS,
  ...ICE_FEATURE_INTENT_KEYS,
  ...FLOODPLAIN_FEATURE_INTENT_KEYS,
] as const;

export type FeatureIntentKey = (typeof FEATURE_INTENT_KEYS)[number];

export type VegetationFeatureIntentKey = (typeof VEGETATION_FEATURE_INTENT_KEYS)[number];
export type WetlandFeatureIntentKey = (typeof WETLAND_FEATURE_INTENT_KEYS)[number];
export type ReefFeatureIntentKey = (typeof REEF_FEATURE_INTENT_KEYS)[number];
export type IceFeatureIntentKey = (typeof ICE_FEATURE_INTENT_KEYS)[number];
export type FloodplainFeatureIntentKey = (typeof FLOODPLAIN_FEATURE_INTENT_KEYS)[number];

/** Runtime schema for one engine-independent Ecology feature intent. */
const FeatureIntentKeySchema = Type.Enum(FEATURE_INTENT_KEYS, {
  description:
    "Abstract Ecology feature intent. Civ7 engine feature keys are chosen by projection.",
});

/** Feature keys that may be published as vegetation intent before engine projection. */
const VegetationFeatureIntentKeySchema = Type.Enum(VEGETATION_FEATURE_INTENT_KEYS, {
  description: "Vegetation-family feature selected from admitted Ecology habitat evidence.",
});

/** Feature keys that may be published as wetland intent before engine projection. */
const WetlandFeatureIntentKeySchema = Type.Enum(WETLAND_FEATURE_INTENT_KEYS, {
  description: "Wetland-family feature selected from admitted Ecology and hydrology evidence.",
});

/** Feature keys that may be published as reef intent before engine projection. */
const ReefFeatureIntentKeySchema = Type.Enum(REEF_FEATURE_INTENT_KEYS, {
  description: "Reef-family or lake-lotus feature selected from admitted aquatic habitat evidence.",
});

/** Feature key that may be published as ice intent before engine projection. */
const IceFeatureIntentKeySchema = Type.Enum(ICE_FEATURE_INTENT_KEYS, {
  description: "Ice feature selected from admitted freeze suitability evidence.",
});

/** Feature keys that may be published as floodplain intent before engine projection. */
const FloodplainFeatureIntentKeySchema = Type.Enum(FLOODPLAIN_FEATURE_INTENT_KEYS, {
  description: "Floodplain feature selected from admitted river class and terrain-family evidence.",
});

/** Runtime schema for one weighted tile claim emitted by a feature planner. */
export const FeaturePlacementSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    feature: FeatureIntentKeySchema,
    weight: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  },
  {
    additionalProperties: false,
    description:
      "One engine-independent Ecology feature claim at a map coordinate with optional confidence weight.",
  }
);

function createFeatureFamilyPlacementSchema<const FeatureSchema extends TSchema>(
  feature: FeatureSchema,
  description: string
) {
  return Type.Object(
    {
      ...FeaturePlacementSchema.properties,
      feature,
    },
    { additionalProperties: false, description }
  );
}

/** One vegetation-family intent with the coordinate and confidence shared by feature planners. */
export const VegetationFeaturePlacementSchema = createFeatureFamilyPlacementSchema(
  VegetationFeatureIntentKeySchema,
  "One vegetation-family feature intent at a map coordinate."
);

/** One wetland-family intent with the coordinate and confidence shared by feature planners. */
export const WetlandFeaturePlacementSchema = createFeatureFamilyPlacementSchema(
  WetlandFeatureIntentKeySchema,
  "One wetland-family feature intent at a map coordinate."
);

/** One reef-family intent with the coordinate and confidence shared by feature planners. */
export const ReefFeaturePlacementSchema = createFeatureFamilyPlacementSchema(
  ReefFeatureIntentKeySchema,
  "One reef-family or lake-lotus feature intent at a map coordinate."
);

/** One ice intent with the coordinate and confidence shared by feature planners. */
export const IceFeaturePlacementSchema = createFeatureFamilyPlacementSchema(
  IceFeatureIntentKeySchema,
  "One ice feature intent at a map coordinate."
);

/** One floodplain-family intent with the coordinate and confidence shared by feature planners. */
export const FloodplainFeaturePlacementSchema = createFeatureFamilyPlacementSchema(
  FloodplainFeatureIntentKeySchema,
  "One floodplain-family feature intent at a map coordinate."
);

export type VegetationFeaturePlacement = Static<typeof VegetationFeaturePlacementSchema>;
export type WetlandFeaturePlacement = Static<typeof WetlandFeaturePlacementSchema>;
export type ReefFeaturePlacement = Static<typeof ReefFeaturePlacementSchema>;
export type IceFeaturePlacement = Static<typeof IceFeaturePlacementSchema>;
export type FloodplainFeaturePlacement = Static<typeof FloodplainFeaturePlacementSchema>;
