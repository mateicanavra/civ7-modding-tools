import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreWetMarshContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/marsh",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    nearRiverMask: TypedArraySchemas.u8({ description: "Mask (1/0): tiles near any river." }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Marsh suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      waterMin01: Type.Number({ default: 0.55, minimum: 0, maximum: 1 }),
      fertilityMin01: Type.Number({ default: 0.2, minimum: 0, maximum: 1 }),
      aridityMax01: Type.Number({ default: 0.6, minimum: 0, maximum: 1 }),
      tempMinC: Type.Number({ default: -2 }),
      tempPeakC: Type.Number({ default: 10 }),
      tempMaxC: Type.Number({ default: 24 }),
    }),
  },
});

export default ScoreWetMarshContract;

