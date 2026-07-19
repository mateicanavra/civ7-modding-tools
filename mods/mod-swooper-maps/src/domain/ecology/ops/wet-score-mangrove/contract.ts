import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const ScoreWetMangroveContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/mangrove",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    intertidalCoastMask: TypedArraySchemas.u8({
      description: "Mask (1/0): low coastal land adjacent to water.",
    }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Mangrove suitability score per tile (0..1)." }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object({
      waterMin01: Type.Number({
        default: 0.45,
        minimum: 0,
        maximum: 1,
        description: "Minimum water availability for mangrove suitability.",
      }),
      fertilityMin01: Type.Number({
        default: 0.15,
        minimum: 0,
        maximum: 1,
        description: "Minimum soil fertility for mangrove suitability.",
      }),
      aridityMax01: Type.Number({
        default: 0.7,
        minimum: 0,
        maximum: 1,
        description: "Maximum aridity for mangrove suitability.",
      }),
      tempWarmStartC: Type.Number({
        default: 18,
        minimum: -100,
        maximum: 100,
        description: "Temperature where mangrove suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 30,
        minimum: -100,
        maximum: 100,
        description: "Temperature where mangrove suitability reaches its warm optimum.",
      }),
    }),
  },
});

export default ScoreWetMangroveContract;
