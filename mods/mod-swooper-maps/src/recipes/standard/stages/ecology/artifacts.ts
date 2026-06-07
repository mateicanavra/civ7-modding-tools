import { TypedArraySchemas, Type, defineArtifact, type Static } from "@swooper/mapgen-core/authoring";
import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";

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
  layers: Type.Object(
    Object.fromEntries(
      FEATURE_PLACEMENT_KEYS.map((featureKey) => [
        featureKey,
        TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
      ])
    )
  ),
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

const PlotEffectKeyArtifactSchema = Type.Unsafe<PlotEffectKey>(
  Type.String({
    description: "Engine plot-effect key planned by Ecology and later projected by map-ecology.",
    pattern: "^PLOTEFFECT_",
  })
);

/**
 * Plot effects are authored as ecology truth because snow/sand/burned placement is
 * scored from biome, climate, and topography artifacts. The map-ecology stage only
 * projects these intents into the adapter, so this artifact preserves the contract
 * between planning and engine stamping without letting projection own the policy.
 */
export const PlotEffectPlacementIntentSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    plotEffect: PlotEffectKeyArtifactSchema,
  },
  { additionalProperties: false }
);

export const PlotEffectPlanArtifactSchema = Type.Array(PlotEffectPlacementIntentSchema);

export type PlotEffectPlanArtifact = Static<typeof PlotEffectPlanArtifactSchema>;

export const BiomeBindingsArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    engineBiomeId: TypedArraySchemas.u16({
      description: "Engine biome id resolved from biome symbols (tile order).",
    }),
    bindingClass: TypedArraySchemas.u8({
      description:
        "Binding class per tile (0=water, 1=unique binding, 2=colliding binding where multiple symbols map to same engine biome).",
    }),
    collapsedBindingCount: Type.Integer({
      minimum: 0,
      description: "Count of land tiles whose symbol maps through a colliding engine biome binding.",
    }),
    landWaterMismatchCount: Type.Integer({
      minimum: 0,
      description: "Count of land-mask mismatches between Morphology truth and engine water state.",
    }),
  },
  { additionalProperties: false }
);

export type BiomeBindingsArtifact = Static<typeof BiomeBindingsArtifactSchema>;

export const FeatureApplyDiagnosticsArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    attempted: Type.Integer({ minimum: 0 }),
    applied: Type.Integer({ minimum: 0 }),
    rejected: Type.Integer({ minimum: 0 }),
    rejectedCanHaveFeature: Type.Integer({ minimum: 0 }),
    rejectedOutOfBounds: Type.Integer({ minimum: 0 }),
    rejectedUnknownFeature: Type.Integer({ minimum: 0 }),
    attemptedByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    appliedByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    rejectedCanHaveFeatureByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    rejectionMask: TypedArraySchemas.u8({
      description: "Per-tile rejection mask (0=accepted/untouched, 1=rejected).",
    }),
  },
  { additionalProperties: false }
);

export type FeatureApplyDiagnosticsArtifact = Static<typeof FeatureApplyDiagnosticsArtifactSchema>;

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
  occupancyFloodplains: defineArtifact({
    name: "occupancyFloodplains",
    id: "artifact:ecology.occupancy.floodplains",
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
  occupancyWetlands: defineArtifact({
    name: "occupancyWetlands",
    id: "artifact:ecology.occupancy.wetlands",
    schema: OccupancyArtifactSchema,
  }),
  occupancyVegetation: defineArtifact({
    name: "occupancyVegetation",
    id: "artifact:ecology.occupancy.vegetation",
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
  featureIntentsFloodplains: defineArtifact({
    name: "featureIntentsFloodplains",
    id: "artifact:ecology.featureIntents.floodplains",
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
  plotEffectPlan: defineArtifact({
    name: "plotEffectPlan",
    id: "artifact:ecology.plotEffectPlan",
    schema: PlotEffectPlanArtifactSchema,
  }),
  biomeBindings: defineArtifact({
    name: "biomeBindings",
    id: "artifact:ecology.biomeBindings",
    schema: BiomeBindingsArtifactSchema,
  }),
  featureApplyDiagnostics: defineArtifact({
    name: "featureApplyDiagnostics",
    id: "artifact:ecology.featureApplyDiagnostics",
    schema: FeatureApplyDiagnosticsArtifactSchema,
  }),
} as const;
