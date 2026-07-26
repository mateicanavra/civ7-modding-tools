import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import aridWaterpointDefinition from "./strategies/arid-waterpoint/config.js";

/** Scores sparse arid habitat around isolated water points from water, fertility, aridity, and temperature. Every implementation shares this admitted input and output boundary. */
const ScoreWetWateringHoleContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/watering-hole",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    isolatedWaterPointMask: TypedArraySchemas.u8({
      description: "Mask (1/0): isolated lowland water-source substrate.",
    }),
    water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({
      description: "Watering hole suitability score per tile (0..1).",
    }),
  }),
  strategies: [aridWaterpointDefinition],
});

export default ScoreWetWateringHoleContract;
