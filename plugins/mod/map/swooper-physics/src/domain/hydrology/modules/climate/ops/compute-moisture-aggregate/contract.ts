import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ClimateSamplingModelSchema } from "../../model/atoms/climate-phase.schema.js";
import { MoistureSampleSchema } from "../../model/atoms/moisture-sample.schema.js";
import phaseReduction from "./strategies/phase-reduction/config.js";

/** Independently reduces weather P/W before phase demand and calendar annual P/W/D. */
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
        precipitation: TypedArraySchemas.f32({ description: "Weather-reduced unclipped precipitation at this phase." }),
        surfaceWetness: TypedArraySchemas.f32({ description: "Independently weather-reduced normalized wetness at this phase." }),
        potentialDemand: Type.Array(Type.Number({ minimum: 0 }), { description: "Demand computed after this phase's temperature and weather-reduced wetness." }),
      }, { additionalProperties: false }), { minItems: 1 }),
    }, { additionalProperties: false }),
  ]),
  output: Type.Union([
    Type.Object({
      reduction: Type.Literal("weather-members"),
      precipitation: TypedArraySchemas.f32({ description: "Equal-weight member precipitation mean without clipping or integer rounding." }),
      surfaceWetness: TypedArraySchemas.f32({ description: "Equal-weight member wetness mean, independent of precipitation reduction." }),
    }, { additionalProperties: false }),
    Type.Object({
      reduction: Type.Literal("annual"),
      precipitation: TypedArraySchemas.f32({ description: "Calendar-weighted annual atmospheric precipitation, unclipped." }),
      surfaceWetness: TypedArraySchemas.f32({ description: "Calendar-weighted annual normalized wetness, independent of precipitation reduction." }),
      rainfallCodec: TypedArraySchemas.u8({ description: "Native rainfall codec derived once from published annual P, rounded and bounded to 200." }),
      potentialDemand: TypedArraySchemas.f32({ description: "Annual mean of phase-resolved potential demand; not recomputed from annual wetness." }),
      precipitationAmplitude: TypedArraySchemas.f32({ description: "Empirical precipitation half-range over every integration phase." }),
      surfaceWetnessAmplitude: TypedArraySchemas.f32({ description: "Empirical normalized wetness half-range over every integration phase." }),
    }, { additionalProperties: false }),
  ]),
  strategies: [phaseReduction],
});
