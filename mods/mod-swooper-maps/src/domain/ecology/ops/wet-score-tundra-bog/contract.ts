import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreWetTundraBogContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/tundra-bog",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    nearRiverMask: TypedArraySchemas.u8({ description: "Mask (1/0): tiles near any river." }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Tundra bog suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      waterMin01: Type.Number({ default: 0.55, minimum: 0, maximum: 1 }),
      fertilityMin01: Type.Number({ default: 0.1, minimum: 0, maximum: 1 }),
      freezeMin01: Type.Number({ default: 0.55, minimum: 0, maximum: 1 }),
      tempColdMaxC: Type.Number({ default: 4 }),
      tempWarmMaxC: Type.Number({ default: 14 }),
    }),
  },
});

export default ScoreWetTundraBogContract;

