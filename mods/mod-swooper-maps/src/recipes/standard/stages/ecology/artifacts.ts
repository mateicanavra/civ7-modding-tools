import { defineArtifact, type Static } from "@swooper/mapgen-core/authoring";
import { Type } from "@swooper/mapgen-core/authoring";

export const BiomeClassificationArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    biomeIndex: Type.Any(),
    vegetationDensity: Type.Any(),
    effectiveMoisture: Type.Any(),
    surfaceTemperature: Type.Any(),
    aridityIndex: Type.Any(),
    freezeIndex: Type.Any(),
    groundIce01: Type.Any(),
    permafrost01: Type.Any(),
    meltPotential01: Type.Any(),
    treeLine01: Type.Any(),
  },
  { additionalProperties: false }
);

export type BiomeClassificationArtifact = Static<typeof BiomeClassificationArtifactSchema>;

export const PedologyArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    soilType: Type.Any(),
    fertility: Type.Any(),
  },
  { additionalProperties: false }
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
        },
        { additionalProperties: false }
      )
    ),
  },
  { additionalProperties: false }
);

export type ResourceBasinsArtifact = Static<typeof ResourceBasinsArtifactSchema>;

export const FeaturePlacementIntentSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    feature: Type.String(),
    weight: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);

export type FeaturePlacementIntent = Static<typeof FeaturePlacementIntentSchema>;

export const FeatureIntentsListArtifactSchema = Type.Array(FeaturePlacementIntentSchema, {
  additionalProperties: false,
});

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
