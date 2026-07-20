import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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
  defaultStrategy: "default",
  strategies: {
    default: Type.Object({
      seaTempColdC: Type.Number({
        default: -10,
        minimum: -100,
        maximum: 100,
        description: "Sea temperature where ice suitability is strongest.",
      }),
      seaTempWarmC: Type.Number({
        default: -2,
        minimum: -100,
        maximum: 100,
        description: "Warm sea-temperature limit for ice suitability.",
      }),
      alpineElevationMinM: Type.Integer({
        default: 2200,
        minimum: 0,
        maximum: 12_000,
        description: "Elevation where alpine ice suitability begins increasing.",
      }),
      alpineElevationMaxM: Type.Integer({
        default: 3400,
        minimum: 0,
        maximum: 12_000,
        description: "Elevation where alpine ice suitability reaches its maximum.",
      }),
      alpineFreezeMin01: Type.Number({
        default: 0.55,
        minimum: 0,
        maximum: 1,
        description: "Minimum freeze index for alpine ice suitability.",
      }),
    }),
  },
});

export default ScoreIceContract;
