import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreWetMangroveContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/mangrove",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    coastalLandMask: TypedArraySchemas.u8({ description: "Mask (1/0): land tiles adjacent to water." }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Mangrove suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      waterMin01: Type.Number({ default: 0.45, minimum: 0, maximum: 1 }),
      fertilityMin01: Type.Number({ default: 0.15, minimum: 0, maximum: 1 }),
      aridityMax01: Type.Number({ default: 0.7, minimum: 0, maximum: 1 }),
      tempWarmStartC: Type.Number({ default: 18 }),
      tempWarmEndC: Type.Number({ default: 30 }),
    }),
  },
});

export default ScoreWetMangroveContract;

