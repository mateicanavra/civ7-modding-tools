import { TypedArraySchemas, Type, defineArtifact, type Static } from "@swooper/mapgen-core/authoring";

export const BiomeClassificationArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol index per tile." }),
    vegetationDensity: TypedArraySchemas.f32({ description: "Vegetation density per tile (0..1)." }),
    effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
    groundIce01: TypedArraySchemas.f32({ description: "Ground ice per tile (0..1)." }),
    permafrost01: TypedArraySchemas.f32({ description: "Permafrost per tile (0..1)." }),
    meltPotential01: TypedArraySchemas.f32({ description: "Melt potential per tile (0..1)." }),
    treeLine01: TypedArraySchemas.f32({ description: "Tree line suitability per tile (0..1)." }),
  }
);

export type BiomeClassificationArtifact = Static<typeof BiomeClassificationArtifactSchema>;

export const PedologyArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    soilType: TypedArraySchemas.u8({ description: "Soil type index per tile." }),
    fertility: TypedArraySchemas.f32({ description: "Fertility per tile (0..1)." }),
  }
);

export type PedologyArtifact = Static<typeof PedologyArtifactSchema>;

export const ResourceBasinsArtifactSchema = Type.Object(
  {
    basins: Type.Array(
      Type.Object(
        {
          resourceId: Type.String(),
          plots: Type.Array(Type.Integer({ minimum: 0 })),
          intensity: Type.Array(Type.Number({ minimum: 0 })),
          confidence: Type.Number({ minimum: 0 }),
        }
      )
    ),
  }
);

export type ResourceBasinsArtifact = Static<typeof ResourceBasinsArtifactSchema>;

export const ScoreLayersArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  layers: Type.Object({
    FEATURE_FOREST: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_RAINFOREST: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_TAIGA: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_SAVANNA_WOODLAND: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_SAGEBRUSH_STEPPE: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_MARSH: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_TUNDRA_BOG: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_MANGROVE: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_OASIS: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_WATERING_HOLE: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_REEF: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_COLD_REEF: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_ATOLL: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_LOTUS: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
    FEATURE_ICE: TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
  }),
});

export type ScoreLayersArtifact = Static<typeof ScoreLayersArtifactSchema>;

export const OccupancyArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  featureIndex: TypedArraySchemas.u16({
    description: "0 = unoccupied, otherwise 1 + FEATURE_KEY_INDEX",
  }),
  reserved: TypedArraySchemas.u8({
    description: "0 = tile can be claimed, 1 = permanently blocked",
  }),
});

export type OccupancyArtifact = Static<typeof OccupancyArtifactSchema>;

export const FeaturePlacementIntentSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    feature: Type.String(),
    weight: Type.Optional(Type.Number()),
  }
);

export type FeaturePlacementIntent = Static<typeof FeaturePlacementIntentSchema>;

export const FeatureIntentsListArtifactSchema = Type.Array(FeaturePlacementIntentSchema);

export type FeatureIntentsListArtifact = Static<typeof FeatureIntentsListArtifactSchema>;

export const ecologyArtifacts = {
  biomeClassification: defineArtifact({
    name: "biomeClassification",
    id: "artifact:ecology.biomeClassification",
    schema: BiomeClassificationArtifactSchema,
  }),
  pedology: defineArtifact({
    name: "pedology",
    id: "artifact:ecology.soils",
    schema: PedologyArtifactSchema,
  }),
  resourceBasins: defineArtifact({
    name: "resourceBasins",
    id: "artifact:ecology.resourceBasins",
    schema: ResourceBasinsArtifactSchema,
  }),
  scoreLayers: defineArtifact({
    name: "scoreLayers",
    id: "artifact:ecology.scoreLayers",
    schema: ScoreLayersArtifactSchema,
  }),
  occupancyBase: defineArtifact({
    name: "occupancyBase",
    id: "artifact:ecology.occupancy.base",
    schema: OccupancyArtifactSchema,
  }),
  occupancyIce: defineArtifact({
    name: "occupancyIce",
    id: "artifact:ecology.occupancy.ice",
    schema: OccupancyArtifactSchema,
  }),
  occupancyReefs: defineArtifact({
    name: "occupancyReefs",
    id: "artifact:ecology.occupancy.reefs",
    schema: OccupancyArtifactSchema,
  }),
  featureIntentsVegetation: defineArtifact({
    name: "featureIntentsVegetation",
    id: "artifact:ecology.featureIntents.vegetation",
    schema: FeatureIntentsListArtifactSchema,
  }),
  featureIntentsWetlands: defineArtifact({
    name: "featureIntentsWetlands",
    id: "artifact:ecology.featureIntents.wetlands",
    schema: FeatureIntentsListArtifactSchema,
  }),
  featureIntentsReefs: defineArtifact({
    name: "featureIntentsReefs",
    id: "artifact:ecology.featureIntents.reefs",
    schema: FeatureIntentsListArtifactSchema,
  }),
  featureIntentsIce: defineArtifact({
    name: "featureIntentsIce",
    id: "artifact:ecology.featureIntents.ice",
    schema: FeatureIntentsListArtifactSchema,
  }),
} as const;
