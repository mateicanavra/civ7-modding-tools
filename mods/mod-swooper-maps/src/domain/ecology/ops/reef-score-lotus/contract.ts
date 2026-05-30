import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreLotusContract = defineOp({
  kind: "compute",
  id: "ecology/reef/score/lotus",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    bathymetry: TypedArraySchemas.i16({
      description: "Bathymetry in meters (0 on land; <=0 in water; more negative is deeper).",
    }),
    shelfMask: TypedArraySchemas.u8({ description: "Mask (1/0): water tile is on shallow shelf." }),
    coastalWater: TypedArraySchemas.u8({ description: "Mask (1/0): water tile is adjacent to land." }),
    distanceToCoast: TypedArraySchemas.u16({ description: "Tile distance from nearest coast." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Lotus suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      tempWarmStartC: Type.Number({ default: 16 }),
      tempWarmEndC: Type.Number({ default: 32 }),
      shallowDepthM: Type.Integer({ default: 0 }),
      deepDepthM: Type.Integer({ default: 40 }),
      maxDistanceToCoast: Type.Integer({ default: 2, minimum: 0 }),
    }),
  },
});

export default ScoreLotusContract;
