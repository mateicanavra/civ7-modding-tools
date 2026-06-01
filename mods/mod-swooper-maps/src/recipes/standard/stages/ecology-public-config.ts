import { Type, type TSchema } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

type MutableSchemaNode = TSchema & {
  description?: string;
  properties?: Record<string, unknown>;
  items?: unknown;
  anyOf?: unknown[];
  oneOf?: unknown[];
  allOf?: unknown[];
  minimum?: number;
  maximum?: number;
  type?: string;
};

type PublicObject = Record<string, unknown>;

const AUTHOR_DESCRIPTION_RE =
  /(impact|controls|sets|determines|affects|used|author|map|gameplay|density|coverage|shape|terrain|biome|river|lake|coast|plate|climate|feature|placement|derived|projection|coordinate)/i;

const FORBIDDEN_AUTHOR_TERMS_RE = /\b(step|op|envelope|internal|strategy)\b/i;

const ecologyOps = ecology.ops;

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return `${trimmed[0]!.toLowerCase()}${trimmed.slice(1)}`;
}

function labelFromKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .toLowerCase();
}

function cleanDescription(value: string): string {
  return value
    .replace(/\binternally\b/gi, "during deterministic computation")
    .replace(/\binternal\b/gi, "pipeline")
    .replace(/\bstrategy\b/gi, "mode")
    .replace(/\bstrategies\b/gi, "modes")
    .replace(/\bops\b/gi, "calculations")
    .replace(/\bop\b/gi, "calculation")
    .replace(/\bsteps\b/gi, "passes")
    .replace(/\bstep\b/gi, "pass")
    .replace(/\benvelopes\b/gi, "groups")
    .replace(/\benvelope\b/gi, "group")
    .replace(/\s+/g, " ")
    .trim();
}

function authorDescription(existing: unknown, label: string): string {
  const publicLabel = cleanDescription(label);
  const text = typeof existing === "string" ? cleanDescription(existing) : "";
  if (!text || FORBIDDEN_AUTHOR_TERMS_RE.test(text)) {
    return `Controls ${publicLabel} for Ecology map generation.`;
  }
  if (AUTHOR_DESCRIPTION_RE.test(text)) return text;
  return `Controls ${publicLabel}: ${sentenceCase(text)}`;
}

function defaultMinimum(label: string, type: string): number {
  const normalized = label.toLowerCase();
  if (
    /(01|0\.\.1|percentile|fraction|confidence|humidity dampening|ceiling|min aridity|max aridity|min freeze|max freeze|freeze min|max vegetation|min fertility|water min|dry min|dry max)/.test(
      normalized
    )
  ) {
    return 0;
  }
  if (/(pct|percent|coverage)/.test(normalized)) return 0;
  if (/\b(radius|distance|spacing|count|target|iterations|class|tiles)\b|per resource/.test(normalized)) {
    return type === "integer" ? 0 : 0;
  }
  if (/(moisture|rainfall|normalization|discharge|depth|elevation max|elevation min|sea level)/.test(normalized)) {
    return -10000;
  }
  if (/(temperature|tempc| c\b|cold|warm|polar|tundra|tropical|lapse|bias)/.test(normalized)) {
    return -100;
  }
  if (/(weight|scale|scalar|base|padding|penalty)/.test(normalized)) return 0;
  return type === "integer" ? -100000 : -100000;
}

function defaultMaximum(label: string, type: string): number {
  const normalized = label.toLowerCase();
  if (
    /(01|0\.\.1|percentile|fraction|confidence|humidity dampening|ceiling|min aridity|max aridity|min freeze|max freeze|freeze min|max vegetation|min fertility|water min|dry min|dry max)/.test(
      normalized
    )
  ) {
    return 1;
  }
  if (/(pct|percent|coverage)/.test(normalized)) return 100;
  if (/\b(class|tiles|iterations|radius|distance|spacing|count|target)\b|per resource/.test(normalized)) {
    return type === "integer" ? 100000 : 100000;
  }
  if (/(moisture|rainfall|normalization|discharge|depth|elevation|sea level)/.test(normalized)) {
    return 10000;
  }
  if (/(weight|scale|scalar|base|padding|penalty)/.test(normalized)) return 1000;
  if (/(temperature|tempc| c\b|cold|warm|polar|tundra|tropical|lapse|bias)/.test(normalized)) {
    return 100;
  }
  return type === "integer" ? 100000 : 100000;
}

function withAuthoringMetadata<T extends TSchema>(schema: T, label: string): T {
  const node = schema as MutableSchemaNode;
  const clone = { ...schema } as MutableSchemaNode;
  clone.description = authorDescription(node.description, label);

  if ((node.type === "number" || node.type === "integer") && clone.minimum === undefined) {
    clone.minimum = defaultMinimum(label, node.type);
  }
  if ((node.type === "number" || node.type === "integer") && clone.maximum === undefined) {
    clone.maximum = defaultMaximum(label, node.type);
  }

  if (node.properties) {
    clone.properties = Object.fromEntries(
      Object.entries(node.properties).map(([key, child]) => [
        key,
        withAuthoringMetadata(child as TSchema, `${label} ${labelFromKey(key)}`),
      ])
    );
  }
  if (Array.isArray(node.items)) {
    clone.items = node.items.map((item, index) =>
      withAuthoringMetadata(item as TSchema, `${label} item ${index + 1}`)
    );
  } else if (node.items) {
    clone.items = withAuthoringMetadata(node.items as TSchema, `${label} item`);
  }
  if (node.anyOf) {
    clone.anyOf = node.anyOf.map((variant) => withAuthoringMetadata(variant as TSchema, label));
  }
  if (node.oneOf) {
    clone.oneOf = node.oneOf.map((variant) => withAuthoringMetadata(variant as TSchema, label));
  }
  if (node.allOf) {
    clone.allOf = node.allOf.map((variant) => withAuthoringMetadata(variant as TSchema, label));
  }

  return clone as T;
}

function optionalAuthorSchema<T extends TSchema>(schema: T, label: string) {
  return Type.Optional(withAuthoringMetadata(schema, label));
}

function profileObjectVariant(
  profile: string,
  schema: TSchema,
  label: string,
  description: string,
  options: { defaultProfile?: string } = {}
) {
  const profileProperty =
    options.defaultProfile === profile
      ? Type.Optional(Type.Literal(profile, { default: profile, description }))
      : Type.Literal(profile, { description });
  return Type.Object(
    {
      profile: profileProperty,
      ...((withAuthoringMetadata(schema, label) as MutableSchemaNode).properties ?? {}),
    },
    {
      additionalProperties: false,
      description: `Controls ${label} for Ecology map generation.`,
    }
  );
}

function profileObjectSchema(
  variants: readonly {
    profile: string;
    schema: TSchema;
    label: string;
  }[],
  defaultProfile: string,
  description: string
) {
  return Type.Optional(
    Type.Union(
      variants.map((variant) =>
        profileObjectVariant(variant.profile, variant.schema, variant.label, description, {
          defaultProfile,
        })
      ) as never,
      { description }
    )
  );
}

function publicObject(value: unknown): PublicObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as PublicObject)
    : {};
}

function withoutProfile(value: unknown): PublicObject {
  const { profile: _profile, ...config } = publicObject(value);
  return config;
}

function profileEnvelope(
  value: unknown,
  profileToMode: Record<string, string>,
  defaultProfile: string
) {
  const config = publicObject(value);
  const profile = typeof config.profile === "string" ? config.profile : defaultProfile;
  const mode = profileToMode[profile] ?? profileToMode[defaultProfile];
  if (!mode) throw new Error(`Unknown Ecology public profile "${profile}".`);
  return { strategy: mode, config: withoutProfile(value) };
}

function defaultEnvelope(config: unknown) {
  return { strategy: "default" as const, config: config ?? {} };
}

export const EcologyPedologyPublicSchema = Type.Object(
  {
    soilClassification: profileObjectSchema(
      [
        {
          profile: "balanced",
          schema: ecologyOps.classifyPedology.strategies.default,
          label: "balanced soil classification",
        },
        {
          profile: "coastalShelf",
          schema: ecologyOps.classifyPedology.strategies["coastal-shelf"],
          label: "coastal shelf soil classification",
        },
        {
          profile: "orogenyBoosted",
          schema: ecologyOps.classifyPedology.strategies["orogeny-boosted"],
          label: "orogeny boosted soil classification",
        },
      ],
      "balanced",
      "Controls the soil-classification profile that emphasizes balanced, coastal-shelf, or orogeny-influenced fertility patterns."
    ),
    resourceBasinPlanning: profileObjectSchema(
      [
        {
          profile: "balanced",
          schema: ecologyOps.planResourceBasins.strategies.default,
          label: "balanced resource basin planning",
        },
        {
          profile: "hydroFluvial",
          schema: ecologyOps.planResourceBasins.strategies["hydro-fluvial"],
          label: "hydro fluvial resource basin planning",
        },
        {
          profile: "mixed",
          schema: ecologyOps.planResourceBasins.strategies.mixed,
          label: "mixed resource basin planning",
        },
      ],
      "balanced",
      "Controls the resource-basin planning profile for balanced, river-shaped, or mixed resource basins."
    ),
    resourceBasinScoring: optionalAuthorSchema(
      ecologyOps.scoreResourceBasins.strategies.default,
      "resource basin scoring"
    ),
  },
  {
    additionalProperties: false,
    description:
      "Ecology pedology controls for soil classification and resource-basin truth before biome classification.",
  }
);

export const EcologyBiomesPublicSchema = Type.Object(
  {
    biomeClassification: optionalAuthorSchema(
      ecologyOps.classifyBiomes.strategies.default,
      "biome classification"
    ),
  },
  {
    additionalProperties: false,
    description:
      "Ecology biome controls for temperature, moisture, aridity, vegetation density, and deterministic biome edge smoothing.",
  }
);

const SubstrateScoringPublicSchema = Type.Object(
  {
    vegetationGrowth: optionalAuthorSchema(
      ecologyOps.computeVegetationSubstrate.strategies.default,
      "vegetation growth substrate"
    ),
    featureHabitats: optionalAuthorSchema(
      ecologyOps.computeFeatureSubstrate.strategies.default,
      "feature habitat substrate"
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
    marsh: optionalAuthorSchema(ecologyOps.scoreWetMarsh.strategies.default, "marsh scoring"),
    tundraBog: optionalAuthorSchema(
      ecologyOps.scoreWetTundraBog.strategies.default,
      "tundra bog scoring"
    ),
    mangrove: optionalAuthorSchema(
      ecologyOps.scoreWetMangrove.strategies.default,
      "mangrove scoring"
    ),
    oasis: optionalAuthorSchema(ecologyOps.scoreWetOasis.strategies.default, "oasis scoring"),
    wateringHole: optionalAuthorSchema(
      ecologyOps.scoreWetWateringHole.strategies.default,
      "watering hole scoring"
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
    warmReef: optionalAuthorSchema(ecologyOps.scoreReef.strategies.default, "warm reef scoring"),
    coldReef: optionalAuthorSchema(
      ecologyOps.scoreColdReef.strategies.default,
      "cold reef scoring"
    ),
    atoll: optionalAuthorSchema(ecologyOps.scoreReefAtoll.strategies.default, "atoll scoring"),
    lotus: optionalAuthorSchema(ecologyOps.scoreReefLotus.strategies.default, "lotus scoring"),
  },
  {
    additionalProperties: false,
    description:
      "Controls reef-family suitability scores before reef placement intent is selected.",
  }
);

const IceScoringPublicSchema = Type.Object(
  {
    ice: optionalAuthorSchema(ecologyOps.scoreIce.strategies.default, "ice scoring"),
  },
  {
    additionalProperties: false,
    description:
      "Controls ice suitability scoring before ice placement intent is selected.",
  }
);

const IcePlanningPublicSchema = profileObjectSchema(
  [
    {
      profile: "default",
      schema: ecologyOps.planIce.strategies.default,
      label: "default ice planning",
    },
    {
      profile: "continentality",
      schema: ecologyOps.planIce.strategies.continentality,
      label: "continentality ice planning",
    },
  ],
  "default",
  "Controls whether ice planning uses the baseline polar profile or a continentality-aware profile."
);

const ReefPlanningPublicSchema = profileObjectSchema(
  [
    {
      profile: "default",
      schema: ecologyOps.planReefs.strategies.default,
      label: "default reef planning",
    },
    {
      profile: "shippingLanes",
      schema: ecologyOps.planReefs.strategies["shipping-lanes"],
      label: "shipping lane reef planning",
    },
  ],
  "default",
  "Controls whether reef planning uses the baseline habitat profile or a shipping-lane spacing profile."
);

const PlotEffectSnowCoveragePublicSchema = Type.Object(
  {
    enabled: Type.Optional(
      Type.Boolean({
        default: true,
        description: "Controls whether snow plot effects are planned.",
      })
    ),
    coveragePct: Type.Optional(
      Type.Number({
        default: 80,
        minimum: 0,
        maximum: 100,
        description:
          "Controls the percent of eligible snow tiles that receive snow plot effects.",
      })
    ),
    lightThreshold: Type.Optional(
      Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description: "Controls the minimum snow suitability score for light snow effects.",
      })
    ),
    mediumThreshold: Type.Optional(
      Type.Number({
        default: 0.6,
        minimum: 0,
        maximum: 1,
        description: "Controls the minimum snow suitability score for medium snow effects.",
      })
    ),
    heavyThreshold: Type.Optional(
      Type.Number({
        default: 0.8,
        minimum: 0,
        maximum: 1,
        description: "Controls the minimum snow suitability score for heavy snow effects.",
      })
    ),
  },
  {
    additionalProperties: false,
    description:
      "Controls snow plot-effect coverage and score thresholds while fixed engine effect names stay selected by the recipe.",
  }
);

const PlotEffectSimpleCoveragePublicSchema = (label: string, defaultEnabled: boolean, defaultCoverage: number) =>
  Type.Object(
    {
      enabled: Type.Optional(
        Type.Boolean({
          default: defaultEnabled,
          description: `Controls whether ${label} plot effects are planned.`,
        })
      ),
      coveragePct: Type.Optional(
        Type.Number({
          default: defaultCoverage,
          minimum: 0,
          maximum: 100,
          description: `Controls the percent of eligible ${label} tiles that receive plot effects.`,
        })
      ),
    },
    {
      additionalProperties: false,
      description: `Controls ${label} plot-effect coverage while fixed engine effect names stay selected by the recipe.`,
    }
  );

const PlotEffectCoveragePublicSchema = Type.Object(
  {
    snow: Type.Optional(PlotEffectSnowCoveragePublicSchema),
    sand: Type.Optional(PlotEffectSimpleCoveragePublicSchema("sand", false, 18)),
    burned: Type.Optional(PlotEffectSimpleCoveragePublicSchema("burned", false, 8)),
  },
  {
    additionalProperties: false,
    description:
      "Controls plot-effect coverage for snow, sand, and burned effects without exposing engine selector identifiers.",
  }
);

const PlotEffectScoringPublicSchema = Type.Object(
  {
    snow: optionalAuthorSchema(ecologyOps.scorePlotEffectsSnow.strategies.default, "snow effect scoring"),
    sand: optionalAuthorSchema(ecologyOps.scorePlotEffectsSand.strategies.default, "sand effect scoring"),
    burned: optionalAuthorSchema(
      ecologyOps.scorePlotEffectsBurned.strategies.default,
      "burned effect scoring"
    ),
  },
  {
    additionalProperties: false,
    description:
      "Controls snow, sand, and burned plot-effect suitability scoring before coverage selection.",
  }
);

export const EcologyFeaturesPublicSchema = Type.Object(
  {
    substrateScoring: Type.Optional(SubstrateScoringPublicSchema),
    wetlandScoring: Type.Optional(WetlandScoringPublicSchema),
    reefScoring: Type.Optional(ReefScoringPublicSchema),
    iceScoring: Type.Optional(IceScoringPublicSchema),
    icePlanning: IcePlanningPublicSchema,
    reefPlanning: ReefPlanningPublicSchema,
    wetlandPlanning: optionalAuthorSchema(
      ecologyOps.planWetlands.strategies.default,
      "wetland planning"
    ),
    vegetationPlanning: optionalAuthorSchema(
      ecologyOps.planVegetation.strategies.default,
      "vegetation planning"
    ),
    plotEffectScoring: Type.Optional(PlotEffectScoringPublicSchema),
    plotEffectCoverage: Type.Optional(PlotEffectCoveragePublicSchema),
  },
  {
    additionalProperties: false,
    description:
      "Ecology feature controls for suitability scoring, feature-family planning, and plot-effect coverage.",
  }
);

const SOIL_PROFILE_TO_MODE: Record<string, string> = {
  balanced: "default",
  coastalShelf: "coastal-shelf",
  orogenyBoosted: "orogeny-boosted",
};

const RESOURCE_BASIN_PROFILE_TO_MODE: Record<string, string> = {
  balanced: "default",
  hydroFluvial: "hydro-fluvial",
  mixed: "mixed",
};

const ICE_PROFILE_TO_MODE: Record<string, string> = {
  default: "default",
  continentality: "continentality",
};

const REEF_PROFILE_TO_MODE: Record<string, string> = {
  default: "default",
  shippingLanes: "shipping-lanes",
};

const PLOT_EFFECT_SELECTORS = {
  snow: {
    light: { typeName: "PLOTEFFECT_SNOW_LIGHT_PERMANENT" },
    medium: { typeName: "PLOTEFFECT_SNOW_MEDIUM_PERMANENT" },
    heavy: { typeName: "PLOTEFFECT_SNOW_HEAVY_PERMANENT" },
  },
  sand: { typeName: "PLOTEFFECT_SAND" },
  burned: { typeName: "PLOTEFFECT_BURNED" },
} as const;

function plotEffectCoverageConfig(value: unknown) {
  const config = publicObject(value);
  const snow = publicObject(config.snow);
  const sand = publicObject(config.sand);
  const burned = publicObject(config.burned);
  return {
    snow: {
      ...snow,
      selectors: PLOT_EFFECT_SELECTORS.snow,
    },
    sand: {
      ...sand,
      selector: PLOT_EFFECT_SELECTORS.sand,
    },
    burned: {
      ...burned,
      selector: PLOT_EFFECT_SELECTORS.burned,
    },
  };
}

export function compileEcologyPedologyPublicConfig(config: Record<string, unknown>) {
  return {
    pedology: {
      classify: profileEnvelope(config.soilClassification, SOIL_PROFILE_TO_MODE, "balanced"),
    },
    "resource-basins": {
      plan: profileEnvelope(
        config.resourceBasinPlanning,
        RESOURCE_BASIN_PROFILE_TO_MODE,
        "balanced"
      ),
      score: defaultEnvelope(config.resourceBasinScoring),
    },
  };
}

export function compileEcologyBiomesPublicConfig(config: Record<string, unknown>) {
  return {
    biomes: {
      classify: defaultEnvelope(config.biomeClassification),
    },
  };
}

export function compileEcologyFeaturesPublicConfig(config: Record<string, unknown>) {
  const substrateScoring = publicObject(config.substrateScoring);
  const wetlandScoring = publicObject(config.wetlandScoring);
  const reefScoring = publicObject(config.reefScoring);
  const iceScoring = publicObject(config.iceScoring);
  const plotEffectScoring = publicObject(config.plotEffectScoring);

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
      planIce: profileEnvelope(config.icePlanning, ICE_PROFILE_TO_MODE, "default"),
    },
    "plan-reefs": {
      planReefs: profileEnvelope(config.reefPlanning, REEF_PROFILE_TO_MODE, "default"),
    },
    "plan-wetlands": {
      planWetlands: defaultEnvelope(config.wetlandPlanning),
    },
    "plan-vegetation": {
      planVegetation: defaultEnvelope(config.vegetationPlanning),
    },
    "plan-plot-effects": {
      scoreSnow: defaultEnvelope(plotEffectScoring.snow),
      scoreSand: defaultEnvelope(plotEffectScoring.sand),
      scoreBurned: defaultEnvelope(plotEffectScoring.burned),
      plotEffects: defaultEnvelope(plotEffectCoverageConfig(config.plotEffectCoverage)),
    },
  };
}
