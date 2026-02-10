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
  maxTemperature: Type.Number({ default: 4 }),
  maxAridity: Type.Number({ default: 0.9, minimum: 0, maximum: 1 }),
  freezeWeight: Type.Number({ default: 1, minimum: 0 }),
  elevationWeight: Type.Number({ default: 1, minimum: 0 }),
  moistureWeight: Type.Number({ default: 1, minimum: 0 }),
  scoreNormalization: Type.Number({ default: 3, minimum: 0.0001 }),
  scoreBias: Type.Number({ default: 0 }),
  elevationStrategy: SnowElevationStrategySchema,
  elevationMin: Type.Number({ default: 200 }),
  elevationMax: Type.Number({ default: 2400 }),
  elevationPercentileMin: Type.Number({ default: 0.7, minimum: 0, maximum: 1 }),
  elevationPercentileMax: Type.Number({ default: 0.98, minimum: 0, maximum: 1 }),
  moistureMin: Type.Number({ default: 40, minimum: 0 }),
  moistureMax: Type.Number({ default: 160, minimum: 0 }),
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

