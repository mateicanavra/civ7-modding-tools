import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreReefContract = defineOp({
  kind: "compute",
  id: "ecology/reef/score/reef",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    bathymetry: TypedArraySchemas.i16({
      description: "Bathymetry in meters (0 on land; <=0 in water; more negative is deeper).",
    }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Reef suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      tempWarmStartC: Type.Number({ default: 14 }),
      tempWarmEndC: Type.Number({ default: 28 }),
      shallowDepthM: Type.Integer({ default: 150 }),
      deepDepthM: Type.Integer({ default: 1200 }),
    }),
  },
});

export default ScoreReefContract;

