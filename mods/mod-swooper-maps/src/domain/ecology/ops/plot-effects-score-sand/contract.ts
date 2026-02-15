import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const BiomeSymbolSchema = Type.Union(
  [
    Type.Literal("snow"),
    Type.Literal("tundra"),
    Type.Literal("boreal"),
    Type.Literal("temperateDry"),
    Type.Literal("temperateHumid"),
    Type.Literal("tropicalSeasonal"),
    Type.Literal("tropicalRainforest"),
    Type.Literal("desert"),
  ],
  {
    description:
      "Biome symbol names used by the ecology classifier (maps to engine biome bindings).",
  }
);

const PlotEffectsScoreSandConfigSchema = Type.Object({
  minAridity: Type.Number({
    default: 0.55,
    minimum: 0,
    maximum: 1,
    description: "Sand is eligible when aridityIndex >= minAridity (0..1).",
  }),
  minTemperature: Type.Number({
    default: 18,
    description: "Sand is eligible when surfaceTemperature >= minTemperature (C).",
  }),
  maxFreeze: Type.Number({
    default: 0.25,
    minimum: 0,
    maximum: 1,
    description: "Sand is eligible when freezeIndex <= maxFreeze (0..1).",
  }),
  maxVegetation: Type.Number({
    default: 0.2,
    minimum: 0,
    maximum: 1,
    description: "Sand is eligible when vegetationDensity <= maxVegetation (0..1).",
  }),
  maxMoisture: Type.Number({
    default: 90,
    minimum: 0,
    description: "Sand is eligible when effectiveMoisture <= maxMoisture.",
  }),
  allowedBiomes: Type.Array(BiomeSymbolSchema, {
    default: ["desert", "temperateDry"],
    description: "Biome symbols allowed to emit sand plot effects (allowlist).",
  }),
});

const PlotEffectsScoreSandContract = defineOp({
  kind: "compute",
  id: "ecology/plot-effects/score/sand",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol indices per tile." }),
    vegetationDensity: TypedArraySchemas.f32({
      description: "Vegetation density per tile (0..1).",
    }),
    effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Surface temperature per tile (C).",
    }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Sand suitability score per tile (0..1)." }),
    eligibleMask: TypedArraySchemas.u8({
      description: "Eligibility mask per tile (1=eligible for selection, 0=ineligible).",
    }),
  }),
  strategies: {
    default: PlotEffectsScoreSandConfigSchema,
  },
});

export default PlotEffectsScoreSandContract;
