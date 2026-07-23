import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Scores warm shallow lake water near shore for lake-lotus habitat. Every implementation shares this admitted input and output boundary. */
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
    lakeMask: TypedArraySchemas.u8({
      description: "Hydrology lake mask per tile (1=lake, 0=non-lake).",
    }),
    shelfMask: TypedArraySchemas.u8({ description: "Mask (1/0): water tile is on shallow shelf." }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({ description: "Tile distance from nearest coast." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Lotus suitability score per tile (0..1)." }),
  }),
  strategies,
});

export default ScoreLotusContract;
