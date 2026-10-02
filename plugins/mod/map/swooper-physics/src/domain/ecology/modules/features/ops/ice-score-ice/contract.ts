import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import marineTemperatureDefinition from "./strategies/marine-temperature/config.js";

/** Scores marine ice suitability from current climate temperature and external-water eligibility. Every implementation shares this admitted input and output boundary. */
const ScoreIceContract = defineOp({
  kind: "compute",
  id: "ecology/ice/score/ice",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      externalWaterMask: TypedArraySchemas.u8({
        description: "Physical external-water recipient membership (1 = eligible, 0 = ineligible).",
      }),
      surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature (C)." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    score01: TypedArraySchemas.f32({ description: "Ice suitability score per tile (0..1)." }),
  }),
  strategies: [marineTemperatureDefinition],
});

export default ScoreIceContract;
