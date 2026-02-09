import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";
import { steps } from "../ecology/steps/index.js";

const VegetationPickingSchema = Type.Object(
  {
    minScoreThreshold: Type.Number({
      description: "Minimum score required for a tile to receive a vegetation feature intent.",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
  },
  { default: {} }
);

const WetFeaturePlacementsSchema = Type.Union(
  [
    Type.Object(
      {
        strategy: Type.Literal("disabled"),
        config: ecology.ops.planWetPlacementMarsh.strategies.disabled,
      }
    ),
    Type.Object(
      {
        strategy: Type.Literal("default"),
        config: ecology.ops.planWetPlacementMarsh.strategies.default,
      }
    ),
  ],
  { default: { strategy: "disabled", config: {} } }
);

const FeaturesPlanPublicSchema = Type.Object(
  {
    vegetation: VegetationPickingSchema,
    wetlands: ecology.ops.planWetlands.config,
    reefs: ecology.ops.planReefs.config,
    ice: ecology.ops.planIce.config,
    wetFeaturePlacements: WetFeaturePlacementsSchema,
  }
);

type FeaturesPlanPublicConfig = Static<typeof FeaturesPlanPublicSchema>;
type StudioUiMetaSentinel = { __studioUiMetaSentinelPath: unknown };

export default createStage({
  id: "ecology-vegetation",
  knobsSchema: Type.Object({}),
  public: Type.Object({
    featuresPlan: Type.Optional(FeaturesPlanPublicSchema),
  }),
  compile: ({ config }) => {
    const compileFeaturesPlan = (
      input: FeaturesPlanPublicConfig | StudioUiMetaSentinel | undefined
    ): Record<string, unknown> | undefined => {
      if (!input) return undefined;
      if ("__studioUiMetaSentinelPath" in input) {
        // Studio typegen probes stage compilation by injecting a sentinel object at each public config key.
        // Forward the sentinel by reference through every internal key so the generator finds exactly one
        // path for this step (it de-dupes by object identity).
        return {
          vegetation: input,
          vegetationSubstrate: input,
          vegetationScoreForest: input,
          vegetationScoreRainforest: input,
          vegetationScoreTaiga: input,
          vegetationScoreSavannaWoodland: input,
          vegetationScoreSagebrushSteppe: input,
          wetlands: input,
          reefs: input,
          ice: input,
          wetPlacementMarsh: input,
          wetPlacementTundraBog: input,
          wetPlacementMangrove: input,
          wetPlacementOasis: input,
          wetPlacementWateringHole: input,
        };
      }
      return {
        vegetation: input.vegetation,
        vegetationSubstrate: { strategy: "default", config: {} },
        vegetationScoreForest: { strategy: "default", config: {} },
        vegetationScoreRainforest: { strategy: "default", config: {} },
        vegetationScoreTaiga: { strategy: "default", config: {} },
        vegetationScoreSavannaWoodland: { strategy: "default", config: {} },
        vegetationScoreSagebrushSteppe: { strategy: "default", config: {} },
        wetlands: input.wetlands,
        reefs: input.reefs,
        ice: input.ice,
        wetPlacementMarsh: input.wetFeaturePlacements,
        wetPlacementTundraBog: input.wetFeaturePlacements,
        wetPlacementMangrove: input.wetFeaturePlacements,
        wetPlacementOasis: input.wetFeaturePlacements,
        wetPlacementWateringHole: input.wetFeaturePlacements,
      };
    };

    return {
      "features-plan": compileFeaturesPlan(config.featuresPlan),
    };
  },
  steps: [steps.featuresPlan],
} as const);
