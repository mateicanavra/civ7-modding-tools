import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ClimateSamplingModelSchema } from "../../model/atoms/climate-phase.schema.js";
import { MoistureSampleSchema } from "../../model/atoms/moisture-sample.schema.js";
import phaseReduction from "./strategies/phase-reduction/config.js";

/** Owns weather-member and annual moisture reductions, including phase-resolved demand evidence. */
export default defineOp({
  kind: "compute",
  id: "hydrology/compute-moisture-aggregate",
  input: Type.Union([
    Type.Object({
      width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
      reduction: Type.Literal("weather-members"),
      samples: Type.Array(MoistureSampleSchema, { minItems: 1 }),
    }, { additionalProperties: false }),
    Type.Object({
      width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
      reduction: Type.Literal("annual"), model: ClimateSamplingModelSchema,
      weights: Type.Array(Type.Number({ exclusiveMinimum: 0 }), { minItems: 1 }),
      samples: Type.Array(Type.Object({
        rainfall: TypedArraySchemas.u8({ description: "Weather-reduced rainfall at this phase." }),
        humidity: TypedArraySchemas.u8({ description: "Weather-reduced humidity at this phase." }),
        potentialDemand: Type.Array(Type.Number({ minimum: 0 }), { description: "Demand computed from this phase's temperature and weather-reduced humidity." }),
      }, { additionalProperties: false }), { minItems: 1 }),
    }, { additionalProperties: false }),
  ]),
  output: Type.Union([
    Type.Object({
      reduction: Type.Literal("weather-members"),
      rainfall: TypedArraySchemas.u8({ description: "Equal-weight weather rainfall mean, rounded and bounded to 255." }),
      humidity: TypedArraySchemas.u8({ description: "Equal-weight weather humidity mean, rounded and bounded to 255." }),
    }, { additionalProperties: false }),
    Type.Object({
      reduction: Type.Literal("annual"),
      rainfall: TypedArraySchemas.u8({ description: "Annual rainfall mean, rounded and bounded to 200." }),
      humidity: TypedArraySchemas.u8({ description: "Annual humidity mean, rounded and bounded to 255." }),
      potentialDemand: TypedArraySchemas.f32({ description: "Annual mean of phase-resolved potential demand." }),
      rainfallAmplitude: TypedArraySchemas.u8({ description: "Half-range over all integration phases, rounded." }),
      humidityAmplitude: TypedArraySchemas.u8({ description: "Half-range over all integration phases, rounded." }),
    }, { additionalProperties: false }),
  ]),
  strategies: [phaseReduction],
});
