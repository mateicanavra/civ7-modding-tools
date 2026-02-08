import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";
import { steps } from "./steps/index.js";

const VegetatedFeaturePlacementsSchema = Type.Union(
  [
    Type.Object(
      {
        strategy: Type.Literal("disabled"),
        config: ecology.ops.planVegetatedPlacementForest.strategies.disabled,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        strategy: Type.Literal("default"),
        config: ecology.ops.planVegetatedPlacementForest.strategies.default,
      },
      { additionalProperties: false }
    ),
  ],
  { default: { strategy: "disabled", config: {} } }
);

const WetFeaturePlacementsSchema = Type.Union(
  [
    Type.Object(
      {
        strategy: Type.Literal("disabled"),
        config: ecology.ops.planWetFeaturePlacements.strategies.disabled,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        strategy: Type.Literal("default"),
        config: ecology.ops.planWetFeaturePlacements.strategies.default,
      },
      { additionalProperties: false }
    ),
  ],
  { default: { strategy: "disabled", config: {} } }
);

const FeaturesPlanPublicSchema = Type.Object(
  {
    vegetation: ecology.ops.planVegetationForest.config,
    wetlands: ecology.ops.planWetlands.config,
    reefs: ecology.ops.planReefs.config,
    ice: ecology.ops.planIce.config,
    vegetatedFeaturePlacements: VegetatedFeaturePlacementsSchema,
    wetFeaturePlacements: WetFeaturePlacementsSchema,
  },
  { additionalProperties: false }
);

type FeaturesPlanPublicConfig = Static<typeof FeaturesPlanPublicSchema>;

const publicSchema = Type.Object(
  {
    pedology: Type.Optional(steps.pedology.contract.schema),
    resourceBasins: Type.Optional(steps.resourceBasins.contract.schema),
    biomes: Type.Optional(steps.biomes.contract.schema),
    biomeEdgeRefine: Type.Optional(steps.biomeEdgeRefine.contract.schema),
    featuresPlan: Type.Optional(FeaturesPlanPublicSchema),
  },
  { additionalProperties: false }
);

export default createStage({
  id: "ecology",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  public: publicSchema,
  compile: ({ env, knobs, config }) => {
    void env;
    void knobs;

    const compileFeaturesPlan = (
      input: FeaturesPlanPublicConfig | undefined
    ): Record<string, unknown> | undefined => {
      if (!input) return undefined;
      return {
        vegetationForest: input.vegetation,
        vegetationRainforest: input.vegetation,
        vegetationTaiga: input.vegetation,
        vegetationSavannaWoodland: input.vegetation,
        vegetationSagebrushSteppe: input.vegetation,
        wetlands: input.wetlands,
        reefs: input.reefs,
        ice: input.ice,
        vegetatedPlacementForest: input.vegetatedFeaturePlacements,
        vegetatedPlacementRainforest: input.vegetatedFeaturePlacements,
        vegetatedPlacementTaiga: input.vegetatedFeaturePlacements,
        vegetatedPlacementSavannaWoodland: input.vegetatedFeaturePlacements,
        vegetatedPlacementSagebrushSteppe: input.vegetatedFeaturePlacements,
        wetFeaturePlacements: input.wetFeaturePlacements,
      };
    };

    return {
      pedology: config.pedology,
      "resource-basins": config.resourceBasins,
      biomes: config.biomes,
      "biome-edge-refine": config.biomeEdgeRefine,
      "features-plan": compileFeaturesPlan(config.featuresPlan),
    };
  },
  steps: [
    steps.pedology,
    steps.resourceBasins,
    steps.biomes,
    steps.biomeEdgeRefine,
    steps.featuresPlan,
  ],
});
