import ecology from "@mapgen/domain/ecology";
import { type TObject, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";

const ecologyOps = ecology.ops;

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

function defaultEnvelope(config: unknown) {
  return { strategy: "default" as const, config };
}

const BalancedSoilClassificationPublicSchema = profileVariant(
  "balanced",
  ecologyOps.classifyPedology.strategies.balanced,
  "Balanced soil classification driven by climate, relief, sediment, and bedrock."
);

const SoilClassificationPublicSchema = Type.Union(
  [
    BalancedSoilClassificationPublicSchema,
    profileVariant(
      "coastalShelf",
      ecologyOps.classifyPedology.strategies["coastal-shelf"],
      "Soil classification that emphasizes coastal-shelf fertility patterns."
    ),
    profileVariant(
      "orogenyBoosted",
      ecologyOps.classifyPedology.strategies["orogeny-boosted"],
      "Soil classification that emphasizes orogeny-influenced fertility patterns."
    ),
  ],
  {
    default: createValidatedDefault(BalancedSoilClassificationPublicSchema),
    description:
      "Controls the soil-classification profile that emphasizes balanced, coastal-shelf, or orogeny-influenced fertility patterns.",
  }
);

const BalancedResourceBasinPlanningPublicSchema = profileVariant(
  "balanced",
  ecologyOps.planResourceBasins.strategies.balanced,
  "Balanced resource-basin planning."
);

const ResourceBasinPlanningPublicSchema = Type.Union(
  [
    BalancedResourceBasinPlanningPublicSchema,
    profileVariant(
      "hydroFluvial",
      ecologyOps.planResourceBasins.strategies["hydro-fluvial"],
      "River-shaped resource-basin planning."
    ),
    profileVariant(
      "mixed",
      ecologyOps.planResourceBasins.strategies.mixed,
      "Mixed resource-basin planning."
    ),
  ],
  {
    default: createValidatedDefault(BalancedResourceBasinPlanningPublicSchema),
    description:
      "Controls the resource-basin planning profile for balanced, river-shaped, or mixed resource basins.",
  }
);

/**
 * Author-facing pedology controls for soil classification and resource-basin planning/scoring.
 * Runtime-derived Ecology truth remains outside this authored boundary.
 */
export const EcologyPedologyPublicSchema = Type.Object(
  {
    soilClassification: SoilClassificationPublicSchema,
    resourceBasinPlanning: ResourceBasinPlanningPublicSchema,
    resourceBasinScoring: requiredPublicSchema(
      ecologyOps.scoreResourceBasins.strategies.default,
      "Controls resource-basin scoring and balancing."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Ecology pedology controls for soil classification and resource-basin truth before biome classification.",
  }
);

const biomeStrategy = ecologyOps.classifyBiomes.strategies.default;
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
      ecologyOps.computeVegetationSubstrate.strategies.default,
      "Controls the normalized substrate fields used for vegetation growth."
    ),
    featureHabitats: requiredPublicSchema(
      ecologyOps.computeFeatureSubstrate.strategies.default,
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
      ecologyOps.scoreWetMarsh.strategies.default,
      "Controls marsh suitability scoring."
    ),
    tundraBog: requiredPublicSchema(
      ecologyOps.scoreWetTundraBog.strategies.default,
      "Controls tundra-bog suitability scoring."
    ),
    mangrove: requiredPublicSchema(
      ecologyOps.scoreWetMangrove.strategies.default,
      "Controls mangrove suitability scoring."
    ),
    oasis: requiredPublicSchema(
      ecologyOps.scoreWetOasis.strategies.default,
      "Controls oasis suitability scoring."
    ),
    wateringHole: requiredPublicSchema(
      ecologyOps.scoreWetWateringHole.strategies.default,
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
      ecologyOps.scoreReef.strategies.default,
      "Controls warm-reef suitability scoring."
    ),
    coldReef: requiredPublicSchema(
      ecologyOps.scoreColdReef.strategies.default,
      "Controls cold-reef suitability scoring."
    ),
    atoll: requiredPublicSchema(
      ecologyOps.scoreReefAtoll.strategies.default,
      "Controls atoll suitability scoring."
    ),
    lotus: requiredPublicSchema(
      ecologyOps.scoreReefLotus.strategies.default,
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
      ecologyOps.scoreIce.strategies.default,
      "Controls ice suitability scoring."
    ),
  },
  {
    additionalProperties: false,
    description: "Controls ice suitability scoring before ice placement intent is selected.",
  }
);

const IcePlanningPublicSchema = requiredPublicSchema(
  ecologyOps.planIce.strategies["score-threshold"],
  "Controls the freeze-score threshold that admits ice placement intent."
);

const HabitatReefPlanningPublicSchema = profileVariant(
  "habitat",
  ecologyOps.planReefs.strategies.habitat,
  "Baseline reef habitat planning."
);

const ReefPlanningPublicSchema = Type.Union(
  [
    HabitatReefPlanningPublicSchema,
    profileVariant(
      "shippingLanes",
      ecologyOps.planReefs.strategies["diagonal-stride"],
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
      ecologyOps.scorePlotEffectsSnow.strategies.default,
      "Controls snow plot-effect suitability scoring."
    ),
    sand: requiredPublicSchema(
      ecologyOps.scorePlotEffectsSand.strategies.default,
      "Controls sand plot-effect suitability scoring."
    ),
    burned: requiredPublicSchema(
      ecologyOps.scorePlotEffectsBurned.strategies.default,
      "Controls burned plot-effect suitability scoring."
    ),
    jungle: requiredPublicSchema(
      ecologyOps.scorePlotEffectsJungle.strategies.default,
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
  ecologyOps.planPlotEffects.strategies.default,
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
      ecologyOps.planWetlands.strategies.default,
      "Controls wetland placement planning."
    ),
    floodplainPlanning: requiredPublicSchema(
      ecologyOps.planFloodplains.strategies.default,
      "Controls floodplain placement planning."
    ),
    vegetationPlanning: requiredPublicSchema(
      ecologyOps.planVegetation.strategies.default,
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

const RESOURCE_BASIN_PROFILE_TO_STRATEGY = {
  balanced: "balanced",
  hydroFluvial: "hydro-fluvial",
  mixed: "mixed",
} as const;

const REEF_PROFILE_TO_STRATEGY = {
  habitat: "habitat",
  shippingLanes: "diagonal-stride",
} as const;

/** Compiles pedology controls into the fixed soil and resource-basin step envelopes. */
export function compileEcologyPedologyPublicConfig(config: Record<string, unknown>) {
  return {
    pedology: {
      classify: profileEnvelope(config.soilClassification, SOIL_PROFILE_TO_STRATEGY),
    },
    "resource-basins": {
      plan: profileEnvelope(config.resourceBasinPlanning, RESOURCE_BASIN_PROFILE_TO_STRATEGY),
      score: defaultEnvelope(config.resourceBasinScoring),
    },
  };
}

/** Compiles biome controls into the Standard recipe's biome-classification envelope. */
export function compileEcologyBiomesPublicConfig(config: Record<string, unknown>) {
  return {
    biomes: {
      classify: defaultEnvelope(config.biomeClassification),
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
      vegetationSubstrate: defaultEnvelope(substrateScoring.vegetationGrowth),
      featureSubstrate: defaultEnvelope(substrateScoring.featureHabitats),
      scoreForest: defaultEnvelope({}),
      scoreRainforest: defaultEnvelope({}),
      scoreTaiga: defaultEnvelope({}),
      scoreSavannaWoodland: defaultEnvelope({}),
      scoreSagebrushSteppe: defaultEnvelope({}),
      scoreWetMarsh: defaultEnvelope(wetlandScoring.marsh),
      scoreWetTundraBog: defaultEnvelope(wetlandScoring.tundraBog),
      scoreWetMangrove: defaultEnvelope(wetlandScoring.mangrove),
      scoreWetOasis: defaultEnvelope(wetlandScoring.oasis),
      scoreWetWateringHole: defaultEnvelope(wetlandScoring.wateringHole),
      scoreReef: defaultEnvelope(reefScoring.warmReef),
      scoreColdReef: defaultEnvelope(reefScoring.coldReef),
      scoreReefAtoll: defaultEnvelope(reefScoring.atoll),
      scoreReefLotus: defaultEnvelope(reefScoring.lotus),
      scoreIce: defaultEnvelope(iceScoring.ice),
    },
    "plan-ice": {
      planIce: { strategy: "score-threshold" as const, config: config.icePlanning },
    },
    "plan-reefs": {
      planReefs: profileEnvelope(config.reefPlanning, REEF_PROFILE_TO_STRATEGY),
    },
    "plan-wetlands": {
      planWetlands: defaultEnvelope(config.wetlandPlanning),
    },
    "plan-floodplains": {
      planFloodplains: defaultEnvelope(config.floodplainPlanning),
    },
    "plan-vegetation": {
      planVegetation: defaultEnvelope(config.vegetationPlanning),
    },
    "plan-plot-effects": {
      scoreSnow: defaultEnvelope(plotEffectScoring.snow),
      scoreSand: defaultEnvelope(plotEffectScoring.sand),
      scoreBurned: defaultEnvelope(plotEffectScoring.burned),
      scoreJungle: defaultEnvelope(plotEffectScoring.jungle),
      plotEffects: defaultEnvelope(config.plotEffectCoverage),
    },
  };
}
