import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreWetWateringHoleContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/watering-hole",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    isolatedRiverMask: TypedArraySchemas.u8({ description: "Mask (1/0): tiles near isolated rivers." }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Watering hole suitability score per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object({
      dryMin01: Type.Number({ default: 0.45, minimum: 0, maximum: 1 }),
      dryMax01: Type.Number({ default: 0.85, minimum: 0, maximum: 1 }),
      lowWaterMin01: Type.Number({ default: 0.35, minimum: 0, maximum: 1 }),
      fertilityMin01: Type.Number({ default: 0.1, minimum: 0, maximum: 1 }),
      tempWarmStartC: Type.Number({ default: 12 }),
      tempWarmEndC: Type.Number({ default: 32 }),
    }),
  },
});

export default ScoreWetWateringHoleContract;

