import ecology from "@mapgen/domain/ecology";
import { type TObject, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";


function requiredPublicSchema<T extends TSchema>(schema: T, description: string) {
  return Type.With(schema, { description });
}

function profileVariant<const Profile extends string, const Schema extends TObject>(
  profile: Profile,
  schema: Schema,
  description: string
) {
  return Type.Object(
    {
      profile: Type.Literal(profile, {
        default: profile,
        description: "Selects the Ecology profile represented by this configuration.",
      }),
      ...schema.properties,
    },
    { additionalProperties: false, description }
  );
}

function createValidatedDefault<const Schema extends TSchema>(schema: Schema) {
  const value = Value.Create(schema);
  Value.Assert(schema, value);
  return value;
}

function profileEnvelope(value: unknown, profileToStrategy: Readonly<Record<string, string>>) {
  const { profile, ...config } = value as Record<string, unknown>;
  const strategy = typeof profile === "string" ? profileToStrategy[profile] : undefined;
  if (!strategy) throw new Error(`Unknown Ecology public profile "${String(profile)}".`);
  return { strategy, config };
}

function defaultEnvelope<const Strategy extends string>(
  operation: Readonly<{ defaultStrategy: Strategy }>,
  config: unknown
) {
  return { strategy: operation.defaultStrategy, config };
}

const BalancedSoilClassificationPublicSchema = profileVariant(
  "balanced",
  ecology.pedology.ops.classifyPedology.strategies.balanced.config,
  "Balanced soil classification driven by climate, relief, sediment, and bedrock."
);

const SoilClassificationPublicSchema = Type.Union(
  [
    BalancedSoilClassificationPublicSchema,
    profileVariant(
      "coastalShelf",
      ecology.pedology.ops.classifyPedology.strategies["coastal-shelf"].config,
      "Soil classification that emphasizes coastal-shelf fertility patterns."
    ),
    profileVariant(
      "orogenyBoosted",
      ecology.pedology.ops.classifyPedology.strategies["orogeny-boosted"].config,
      "Soil classification that emphasizes orogeny-influenced fertility patterns."
    ),
  ],
  {
    default: createValidatedDefault(BalancedSoilClassificationPublicSchema),
    description:
      "Controls the soil-classification profile that emphasizes balanced, coastal-shelf, or orogeny-influenced fertility patterns.",
  }
);

/**
 * Author-facing pedology controls for soil classification. Runtime-derived
 * Ecology truth remains outside this authored boundary.
 */
export const EcologyPedologyPublicSchema = Type.Object(
  {
    soilClassification: SoilClassificationPublicSchema,
  },
  {
    additionalProperties: false,
    description: "Ecology pedology controls for soil classification before biome classification.",
  }
);

const biomeStrategy = ecology.biomes.ops.classifyBiomes.strategies["biophysical-gaussian"].config;
const BiomeClassificationPublicSchema = Type.With(biomeStrategy, {
  description:
    "Controls temperature, moisture, aridity, vegetation density, and deterministic biome edge smoothing.",
});

/** Author-facing biome-classification controls over stable Ecology strategy schemas. */
export const EcologyBiomesPublicSchema = Type.Object(
  { biomeClassification: BiomeClassificationPublicSchema },
  {
    additionalProperties: false,
    description:
      "Ecology biome controls for temperature, moisture, aridity, vegetation density, and deterministic biome edge smoothing.",
  }
);

const SubstrateScoringPublicSchema = Type.Object(
  {
    vegetationGrowth: requiredPublicSchema(
      ecology.features.ops.computeVegetationSubstrate.strategies["bioclimatic-substrate"].config,
      "Controls the normalized substrate fields used for vegetation growth."
    ),
    featureHabitats: requiredPublicSchema(
      ecology.features.ops.computeFeatureSubstrate.strategies.hydromorphic.config,
      "Controls reusable feature-family habitat substrate fields."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Controls reusable Ecology substrate fields for vegetation growth and feature-family habitat scoring.",
  }
);

const WetlandScoringPublicSchema = Type.Object(
  {
    marsh: requiredPublicSchema(
      ecology.features.ops.scoreWetMarsh.strategies["temperate-hydromorphic"].config,
      "Controls marsh suitability scoring."
    ),
    tundraBog: requiredPublicSchema(
      ecology.features.ops.scoreWetTundraBog.strategies["cold-hydromorphic"].config,
      "Controls tundra-bog suitability scoring."
    ),
    mangrove: requiredPublicSchema(
      ecology.features.ops.scoreWetMangrove.strategies["warm-intertidal"].config,
      "Controls mangrove suitability scoring."
    ),
    oasis: requiredPublicSchema(
      ecology.features.ops.scoreWetOasis.strategies["warm-arid-waterpoint"].config,
      "Controls oasis suitability scoring."
    ),
    wateringHole: requiredPublicSchema(
      ecology.features.ops.scoreWetWateringHole.strategies["arid-waterpoint"].config,
      "Controls watering-hole suitability scoring."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Controls wetland-family suitability scores before wetland placement intent is selected.",
  }
);

const ReefScoringPublicSchema = Type.Object(
  {
    warmReef: requiredPublicSchema(
      ecology.features.ops.scoreReef.strategies["warm-coastal-shelf"].config,
      "Controls warm-reef suitability scoring."
    ),
    coldReef: requiredPublicSchema(
      ecology.features.ops.scoreColdReef.strategies["cold-shelf"].config,
      "Controls cold-reef suitability scoring."
    ),
    atoll: requiredPublicSchema(
      ecology.features.ops.scoreReefAtoll.strategies["warm-ocean-bank"].config,
      "Controls atoll suitability scoring."
    ),
    lotus: requiredPublicSchema(
      ecology.features.ops.scoreReefLotus.strategies["warm-shallow-lake"].config,
      "Controls lotus suitability scoring."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Controls reef-family suitability scores before reef placement intent is selected.",
  }
);

const IceScoringPublicSchema = Type.Object(
  {
    ice: requiredPublicSchema(
      ecology.features.ops.scoreIce.strategies["thermal-elevation"].config,
      "Controls ice suitability scoring."
    ),
  },
  {
    additionalProperties: false,
    description: "Controls ice suitability scoring before ice placement intent is selected.",
  }
);

const IcePlanningPublicSchema = requiredPublicSchema(
  ecology.features.ops.planIce.strategies["score-threshold"].config,
  "Controls the freeze-score threshold that admits ice placement intent."
);

const HabitatReefPlanningPublicSchema = profileVariant(
  "habitat",
  ecology.features.ops.planReefs.strategies.habitat.config,
  "Baseline reef habitat planning."
);

const ReefPlanningPublicSchema = Type.Union(
  [
    HabitatReefPlanningPublicSchema,
    profileVariant(
      "shippingLanes",
      ecology.features.ops.planReefs.strategies["diagonal-stride"].config,
      "Diagonal reef spacing for the Shipping Lanes map profile."
    ),
  ],
  {
    default: createValidatedDefault(HabitatReefPlanningPublicSchema),
    description:
      "Controls whether reef planning uses the baseline habitat profile or a shipping-lane spacing profile.",
  }
);

const PlotEffectScoringPublicSchema = Type.Object(
  {
    snow: requiredPublicSchema(
      ecology.plotEffects.ops.scorePlotEffectsSnow.strategies["cold-elevation"].config,
      "Controls snow plot-effect suitability scoring."
    ),
    sand: requiredPublicSchema(
      ecology.plotEffects.ops.scorePlotEffectsSand.strategies["arid-thermal"].config,
      "Controls sand plot-effect suitability scoring."
    ),
    burned: requiredPublicSchema(
      ecology.plotEffects.ops.scorePlotEffectsBurned.strategies["arid-thermal"].config,
      "Controls burned plot-effect suitability scoring."
    ),
    jungle: requiredPublicSchema(
      ecology.plotEffects.ops.scorePlotEffectsJungle.strategies["hot-wet-dense"].config,
      "Controls jungle plot-effect suitability scoring."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Controls snow, sand, burned, and jungle plot-effect suitability scoring before coverage selection.",
  }
);

const PlotEffectCoveragePublicSchema = requiredPublicSchema(
  ecology.plotEffects.ops.planPlotEffects.strategies["ranked-coverage"].config,
  "Controls snow, sand, burned, and jungle plot-effect coverage and thresholds."
);

/**
 * Author-facing Ecology feature controls spanning substrate scores, feature intent, and plot
 * effects while leaving engine projection to the later map stage.
 */
export const EcologyFeaturesPublicSchema = Type.Object(
  {
    substrateScoring: SubstrateScoringPublicSchema,
    wetlandScoring: WetlandScoringPublicSchema,
    reefScoring: ReefScoringPublicSchema,
    iceScoring: IceScoringPublicSchema,
    icePlanning: IcePlanningPublicSchema,
    reefPlanning: ReefPlanningPublicSchema,
    wetlandPlanning: requiredPublicSchema(
      ecology.features.ops.planWetlands.strategies["habitat-confidence"].config,
      "Controls wetland placement planning."
    ),
    floodplainPlanning: requiredPublicSchema(
      ecology.features.ops.planFloodplains.strategies["highest-confidence"].config,
      "Controls floodplain placement planning."
    ),
    vegetationPlanning: requiredPublicSchema(
      ecology.features.ops.planVegetation.strategies["habitat-confidence"].config,
      "Controls vegetation placement planning."
    ),
    plotEffectScoring: PlotEffectScoringPublicSchema,
    plotEffectCoverage: PlotEffectCoveragePublicSchema,
  },
  {
    additionalProperties: false,
    description:
      "Ecology feature controls for suitability scoring, feature-family planning, and plot-effect coverage.",
  }
);

const SOIL_PROFILE_TO_STRATEGY = {
  balanced: "balanced",
  coastalShelf: "coastal-shelf",
  orogenyBoosted: "orogeny-boosted",
} as const;

const REEF_PROFILE_TO_STRATEGY = {
  habitat: "habitat",
  shippingLanes: "diagonal-stride",
} as const;

/** Compiles pedology controls into the soil-classification step envelope. */
export function compileEcologyPedologyPublicConfig(config: Record<string, unknown>) {
  return {
    pedology: {
      classify: profileEnvelope(config.soilClassification, SOIL_PROFILE_TO_STRATEGY),
    },
  };
}

/** Compiles biome controls into the Standard recipe's biome-classification envelope. */
export function compileEcologyBiomesPublicConfig(config: Record<string, unknown>) {
  return {
    biomes: {
      classify: defaultEnvelope(ecology.biomes.ops.classifyBiomes, config.biomeClassification),
    },
  };
}

/**
 * Compiles feature controls into the fixed scoring, intent-planning, and plot-effect envelopes
 * without executing Ecology operations.
 */
export function compileEcologyFeaturesPublicConfig(config: Record<string, unknown>) {
  const substrateScoring = config.substrateScoring as Record<string, unknown>;
  const wetlandScoring = config.wetlandScoring as Record<string, unknown>;
  const reefScoring = config.reefScoring as Record<string, unknown>;
  const iceScoring = config.iceScoring as Record<string, unknown>;
  const plotEffectScoring = config.plotEffectScoring as Record<string, unknown>;

  return {
    "score-layers": {
      vegetationSubstrate: defaultEnvelope(
        ecology.features.ops.computeVegetationSubstrate,
        substrateScoring.vegetationGrowth
      ),
      featureSubstrate: defaultEnvelope(
        ecology.features.ops.computeFeatureSubstrate,
        substrateScoring.featureHabitats
      ),
      scoreForest: defaultEnvelope(ecology.features.ops.scoreVegetationForest, {}),
      scoreRainforest: defaultEnvelope(ecology.features.ops.scoreVegetationRainforest, {}),
      scoreTaiga: defaultEnvelope(ecology.features.ops.scoreVegetationTaiga, {}),
      scoreSavannaWoodland: defaultEnvelope(ecology.features.ops.scoreVegetationSavannaWoodland, {}),
      scoreSagebrushSteppe: defaultEnvelope(ecology.features.ops.scoreVegetationSagebrushSteppe, {}),
      scoreWetMarsh: defaultEnvelope(ecology.features.ops.scoreWetMarsh, wetlandScoring.marsh),
      scoreWetTundraBog: defaultEnvelope(ecology.features.ops.scoreWetTundraBog, wetlandScoring.tundraBog),
      scoreWetMangrove: defaultEnvelope(ecology.features.ops.scoreWetMangrove, wetlandScoring.mangrove),
      scoreWetOasis: defaultEnvelope(ecology.features.ops.scoreWetOasis, wetlandScoring.oasis),
      scoreWetWateringHole: defaultEnvelope(
        ecology.features.ops.scoreWetWateringHole,
        wetlandScoring.wateringHole
      ),
      scoreReef: defaultEnvelope(ecology.features.ops.scoreReef, reefScoring.warmReef),
      scoreColdReef: defaultEnvelope(ecology.features.ops.scoreColdReef, reefScoring.coldReef),
      scoreReefAtoll: defaultEnvelope(ecology.features.ops.scoreReefAtoll, reefScoring.atoll),
      scoreReefLotus: defaultEnvelope(ecology.features.ops.scoreReefLotus, reefScoring.lotus),
      scoreIce: defaultEnvelope(ecology.features.ops.scoreIce, iceScoring.ice),
    },
    "plan-ice": {
      planIce: { strategy: "score-threshold" as const, config: config.icePlanning },
    },
    "plan-reefs": {
      planReefs: profileEnvelope(config.reefPlanning, REEF_PROFILE_TO_STRATEGY),
    },
    "plan-wetlands": {
      planWetlands: defaultEnvelope(ecology.features.ops.planWetlands, config.wetlandPlanning),
    },
    "plan-floodplains": {
      planFloodplains: defaultEnvelope(ecology.features.ops.planFloodplains, config.floodplainPlanning),
    },
    "plan-vegetation": {
      planVegetation: defaultEnvelope(ecology.features.ops.planVegetation, config.vegetationPlanning),
    },
    "plan-plot-effects": {
      scoreSnow: defaultEnvelope(ecology.plotEffects.ops.scorePlotEffectsSnow, plotEffectScoring.snow),
      scoreSand: defaultEnvelope(ecology.plotEffects.ops.scorePlotEffectsSand, plotEffectScoring.sand),
      scoreBurned: defaultEnvelope(ecology.plotEffects.ops.scorePlotEffectsBurned, plotEffectScoring.burned),
      scoreJungle: defaultEnvelope(ecology.plotEffects.ops.scorePlotEffectsJungle, plotEffectScoring.jungle),
      plotEffects: defaultEnvelope(ecology.plotEffects.ops.planPlotEffects, config.plotEffectCoverage),
    },
  };
}
