import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Scores cold saturated land from hydromorphic substrate, water, fertility, freeze, and temperature. Every implementation shares this admitted input and output boundary. */
const ScoreWetTundraBogContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/tundra-bog",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    hydromorphicMask: TypedArraySchemas.u8({
      description: "Mask (1/0): floodplain, sink-basin, or intertidal wetland substrate.",
    }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({
      description: "Tundra bog suitability score per tile (0..1).",
    }),
  }),
  strategies,
});

export default ScoreWetTundraBogContract;
