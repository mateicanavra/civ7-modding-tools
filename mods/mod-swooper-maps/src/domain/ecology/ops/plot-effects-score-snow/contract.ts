import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const SnowElevationStrategySchema = Type.Union(
  [Type.Literal("absolute"), Type.Literal("percentile")],
  {
    description:
      "Elevation normalization strategy for snow scoring: absolute meters or percentile-based land elevation.",
    default: "absolute",
  }
);

const PlotEffectsScoreSnowConfigSchema = Type.Object({
  maxTemperature: Type.Number({
    default: 4,
    description: "Snow is eligible when surfaceTemperature <= maxTemperature (C).",
  }),
  maxAridity: Type.Number({
    default: 0.9,
    minimum: 0,
    maximum: 1,
    description: "Snow is eligible when aridityIndex <= maxAridity (0..1).",
  }),
  freezeWeight: Type.Number({
    default: 1,
    minimum: 0,
    description: "Weight of freezeIndex contribution to the raw snow suitability score.",
  }),
  elevationWeight: Type.Number({
    default: 1,
    minimum: 0,
    description: "Weight of elevation contribution to the raw snow suitability score.",
  }),
  moistureWeight: Type.Number({
    default: 1,
    minimum: 0,
    description: "Weight of effectiveMoisture contribution to the raw snow suitability score.",
  }),
  scoreNormalization: Type.Number({
    default: 3,
    minimum: 0.0001,
    description: "Divisor for raw score normalization before clamping to 0..1.",
  }),
  scoreBias: Type.Number({ default: 0, description: "Additive bias applied to the raw snow score." }),
  elevationStrategy: SnowElevationStrategySchema,
  elevationMin: Type.Number({ default: 200, description: "Minimum elevation used for elevation normalization (m)." }),
  elevationMax: Type.Number({ default: 2400, description: "Maximum elevation used for elevation normalization (m)." }),
  elevationPercentileMin: Type.Number({
    default: 0.7,
    minimum: 0,
    maximum: 1,
    description: "Minimum land elevation percentile used when elevationStrategy is percentile (0..1).",
  }),
  elevationPercentileMax: Type.Number({
    default: 0.98,
    minimum: 0,
    maximum: 1,
    description: "Maximum land elevation percentile used when elevationStrategy is percentile (0..1).",
  }),
  moistureMin: Type.Number({ default: 40, minimum: 0, description: "Minimum effectiveMoisture used for normalization." }),
  moistureMax: Type.Number({ default: 160, minimum: 0, description: "Maximum effectiveMoisture used for normalization." }),
});

const PlotEffectsScoreSnowContract = defineOp({
  kind: "compute",
  id: "ecology/plot-effects/score/snow",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Snow suitability score per tile (0..1)." }),
    eligibleMask: TypedArraySchemas.u8({
      description: "Eligibility mask per tile (1=eligible for selection, 0=ineligible).",
    }),
  }),
  strategies: {
    default: PlotEffectsScoreSnowConfigSchema,
  },
});

export default PlotEffectsScoreSnowContract;
