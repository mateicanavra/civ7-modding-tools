import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreColdReefContract = defineOp({
  kind: "compute",
  id: "ecology/reef/score/cold-reef",
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
    score01: TypedArraySchemas.f32({ description: "Cold reef suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      tempColdMaxC: Type.Number({ default: 10 }),
      tempWarmMaxC: Type.Number({ default: 20 }),
      shallowDepthM: Type.Integer({ default: 150 }),
      deepDepthM: Type.Integer({ default: 1200 }),
    }),
  },
});

export default ScoreColdReefContract;

