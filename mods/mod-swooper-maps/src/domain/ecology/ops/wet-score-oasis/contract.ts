import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const ScoreWetOasisContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/oasis",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    isolatedWaterPointMask: TypedArraySchemas.u8({
      description: "Mask (1/0): isolated lowland water-source substrate.",
    }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Oasis suitability score per tile (0..1)." }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object({
      dryMin01: Type.Number({
        default: 0.6,
        minimum: 0,
        maximum: 1,
        description: "Minimum aridity for oasis suitability.",
      }),
      dryMax01: Type.Number({
        default: 0.95,
        minimum: 0,
        maximum: 1,
        description: "Upper aridity bound for oasis suitability.",
      }),
      waterMin01: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description: "Minimum local water availability for oasis suitability.",
      }),
      tempWarmStartC: Type.Number({
        default: 20,
        minimum: -100,
        maximum: 100,
        description: "Temperature where oasis suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 38,
        minimum: -100,
        maximum: 100,
        description: "Temperature where oasis suitability reaches its warm optimum.",
      }),
    }),
  },
});

export default ScoreWetOasisContract;
