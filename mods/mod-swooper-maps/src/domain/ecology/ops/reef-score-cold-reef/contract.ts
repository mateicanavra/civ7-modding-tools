import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import coldShelfDefinition from "./strategies/cold-shelf/config.js";

/** Scores cold shelf water within authored temperature, depth, and coast-distance windows. Every implementation shares this admitted input and output boundary. */
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
    shelfMask: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is on continental shelf or edge.",
    }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({ description: "Tile distance from nearest coast." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Cold reef suitability score per tile (0..1)." }),
  }),
  strategies: [coldShelfDefinition],
});

export default ScoreColdReefContract;
