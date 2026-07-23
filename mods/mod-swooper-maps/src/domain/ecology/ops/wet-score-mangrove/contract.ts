import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import warmIntertidalDefinition from "./strategies/warm-intertidal/config.js";

/** Scores warm intertidal coast habitat from water, fertility, aridity, and temperature evidence. Every implementation shares this admitted input and output boundary. */
const ScoreWetMangroveContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/mangrove",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    intertidalCoastMask: TypedArraySchemas.u8({
      description: "Mask (1/0): low coastal land adjacent to water.",
    }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Mangrove suitability score per tile (0..1)." }),
  }),
  strategies: [warmIntertidalDefinition],
});

export default ScoreWetMangroveContract;
