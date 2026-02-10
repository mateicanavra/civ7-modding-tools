import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreWetOasisContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/oasis",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    isolatedRiverMask: TypedArraySchemas.u8({ description: "Mask (1/0): tiles near isolated rivers." }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Oasis suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      dryMin01: Type.Number({ default: 0.6, minimum: 0, maximum: 1 }),
      dryMax01: Type.Number({ default: 0.95, minimum: 0, maximum: 1 }),
      lowWaterMin01: Type.Number({ default: 0.55, minimum: 0, maximum: 1 }),
      tempWarmStartC: Type.Number({ default: 20 }),
      tempWarmEndC: Type.Number({ default: 38 }),
    }),
  },
});

export default ScoreWetOasisContract;

