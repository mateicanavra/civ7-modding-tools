import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

const publicSchema = Type.Object(
  {
    pedology: Type.Optional(steps.pedology.contract.schema),
    resourceBasins: Type.Optional(steps.resourceBasins.contract.schema),
    biomes: Type.Optional(steps.biomes.contract.schema),
    biomeEdgeRefine: Type.Optional(steps.biomeEdgeRefine.contract.schema),
    featuresPlan: Type.Optional(
      Type.Omit(steps.featuresPlan.contract.schema, [
        "advancedVegetatedFeaturePlacements",
        "advancedWetFeaturePlacements",
      ])
    ),
  },
  { additionalProperties: false }
);

type EcologyStagePublicConfig = Static<typeof publicSchema>;
type FeaturesPlanPublicConfig = NonNullable<EcologyStagePublicConfig["featuresPlan"]>;
type FeaturesPlanInternalConfig = Static<typeof steps.featuresPlan.contract.schema>;

type FeaturesPlanTranslatedConfig = Omit<
  FeaturesPlanPublicConfig,
  "vegetatedFeaturePlacements" | "wetFeaturePlacements"
> &
  Partial<
    Pick<
      FeaturesPlanInternalConfig,
      "advancedVegetatedFeaturePlacements" | "advancedWetFeaturePlacements"
    >
  >;

function translateFeaturesPlanConfig(input: FeaturesPlanPublicConfig): FeaturesPlanTranslatedConfig {
  const { vegetatedFeaturePlacements, wetFeaturePlacements, ...rest } = input;
  return {
    ...rest,
    ...(vegetatedFeaturePlacements
      ? { advancedVegetatedFeaturePlacements: vegetatedFeaturePlacements }
      : null),
    ...(wetFeaturePlacements ? { advancedWetFeaturePlacements: wetFeaturePlacements } : null),
  };
}

export default createStage({
  id: "ecology",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  public: publicSchema,
  compile: ({ env, knobs, config }) => {
    void env;
    void knobs;
    const featuresPlan = config.featuresPlan
      ? translateFeaturesPlanConfig(config.featuresPlan)
      : config.featuresPlan;

    return {
      pedology: config.pedology,
      "resource-basins": config.resourceBasins,
      biomes: config.biomes,
      "biome-edge-refine": config.biomeEdgeRefine,
      "features-plan": featuresPlan,
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
