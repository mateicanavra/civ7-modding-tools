import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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
    shelfMask: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is on continental shelf.",
    }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({ description: "Tile distance from nearest coast." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Reef suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      tempWarmStartC: Type.Number({
        default: 14,
        minimum: -100,
        maximum: 100,
        description: "Temperature where warm-reef suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 28,
        minimum: -100,
        maximum: 100,
        description: "Temperature where warm-reef suitability reaches its warm optimum.",
      }),
      shallowDepthM: Type.Integer({
        default: 0,
        minimum: 0,
        maximum: 12_000,
        description: "Shallow-water depth used for warm-reef scoring.",
      }),
      deepDepthM: Type.Integer({
        default: 120,
        minimum: 0,
        maximum: 12_000,
        description: "Deep-water limit used for warm-reef scoring.",
      }),
      maxDistanceToCoast: Type.Integer({
        default: 3,
        minimum: 0,
        maximum: 512,
        description: "Maximum tile distance from coast for warm-reef suitability.",
      }),
    }),
  },
});

export default ScoreReefContract;
