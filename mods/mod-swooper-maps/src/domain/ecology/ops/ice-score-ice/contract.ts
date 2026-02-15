import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreIceContract = defineOp({
  kind: "compute",
  id: "ecology/ice/score/ice",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation in meters." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Ice suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      seaTempColdC: Type.Number({ default: -10 }),
      seaTempWarmC: Type.Number({ default: -2 }),
      alpineElevationMinM: Type.Integer({ default: 2200 }),
      alpineElevationMaxM: Type.Integer({ default: 3400 }),
      alpineFreezeMin01: Type.Number({ default: 0.55, minimum: 0, maximum: 1 }),
    }),
  },
});

export default ScoreIceContract;

