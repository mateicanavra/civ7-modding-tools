import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import warmAridWaterpointDefinition from "./strategies/warm-arid-waterpoint/config.js";

/** Scores warm arid land around isolated water points without treating broad wetlands as oasis habitat. Every implementation shares this admitted input and output boundary. */
const ScoreWetOasisContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/oasis",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    isolatedWaterPointMask: TypedArraySchemas.u8({
      description: "Mask (1/0): isolated lowland water-source substrate.",
    }),
    plantWater01: TypedArraySchemas.f32({ description: "Normalized plant-water support, not a saturation or geometry inference (0..1)." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Atmospheric aridity for the climatic habitat gate (0..1)." }),
    surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Oasis suitability score per tile (0..1)." }),
  }),
  strategies: [warmAridWaterpointDefinition],
});

export default ScoreWetOasisContract;
