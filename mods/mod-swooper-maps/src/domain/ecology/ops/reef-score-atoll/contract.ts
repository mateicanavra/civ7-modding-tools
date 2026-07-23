import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import warmOceanBankDefinition from "./strategies/warm-ocean-bank/config.js";

/** Scores warm offshore ocean banks within authored depth and coast-distance windows for atoll habitat. Every implementation shares this admitted input and output boundary. */
const ScoreAtollContract = defineOp({
  kind: "compute",
  id: "ecology/reef/score/atoll",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    bathymetry: TypedArraySchemas.i16({
      description: "Bathymetry in meters (0 on land; <=0 in water; more negative is deeper).",
    }),
    shelfMask: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is on shallow shelf or bank.",
    }),
    openOceanMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): downstream engine surface treats this water tile as open ocean rather than coast/shelf.",
    }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tile is adjacent to existing land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({ description: "Tile distance from nearest coast." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Atoll suitability score per tile (0..1)." }),
  }),
  strategies: [warmOceanBankDefinition],
});

export default ScoreAtollContract;
