import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import sourceLedDrylandDefinition from "./strategies/source-led-dryland/config.js";

/** Scores admitted local surface-water opportunity in dry climatic context; native desert compatibility is planned separately. */
const ScoreWetOasisContract = defineOp({
  kind: "compute",
  id: "ecology/wet/score/oasis",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    localSurfaceWaterOpportunity: TypedArraySchemas.f32({
      description: "Hydrology-owned annual local surface-water opportunity per represented tile area, in empirical rainfall-index units.",
    }),
    pet: TypedArraySchemas.f32({ description: "Published post-albedo potential demand in the same empirical scale as local opportunity." }),
    aridityIndex: TypedArraySchemas.f32({ description: "Atmospheric aridity for the climatic habitat gate (0..1)." }),
  }),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Oasis suitability score per tile (0..1)." }),
  }),
  strategies: [sourceLedDrylandDefinition],
});

export default ScoreWetOasisContract;
