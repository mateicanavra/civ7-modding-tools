import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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

// Jungle stress = the physical "deep rainforest is dangerous" signal: HOT + HUMID + DENSE.
// Mirrors the sand scorer's shape but inverts the climate axes (sand wants arid/sparse; jungle
// wants wet/lush). High score = hottest, wettest, most overgrown interior rainforest — where
// JUNGLE_FEVER (heat exhaustion + disease) belongs.
const PlotEffectsScoreJungleConfigSchema = Type.Object({
  minTemperature: Type.Number({
    default: 22,
    description: "Jungle is eligible when surfaceTemperature >= minTemperature (C).",
  }),
  minMoisture: Type.Number({
    default: 110,
    minimum: 0,
    description: "Jungle is eligible when effectiveMoisture >= minMoisture.",
  }),
  minVegetation: Type.Number({
    default: 0.45,
    minimum: 0,
    maximum: 1,
    description: "Jungle is eligible when vegetationDensity >= minVegetation (0..1).",
  }),
  allowedBiomes: Type.Array(BiomeSymbolSchema, {
    default: ["tropicalRainforest"],
    description: "Biome symbols allowed to emit jungle plot effects (allowlist).",
  }),
});

const PlotEffectsScoreJungleContract = defineOp({
  kind: "compute",
  id: "ecology/plot-effects/score/jungle",
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
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Jungle stress score per tile (0..1)." }),
    eligibleMask: TypedArraySchemas.u8({
      description: "Eligibility mask per tile (1=eligible for selection, 0=ineligible).",
    }),
  }),
  strategies: {
    default: PlotEffectsScoreJungleConfigSchema,
  },
});

export default PlotEffectsScoreJungleContract;
