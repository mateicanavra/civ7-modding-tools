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
        precipitation: TypedArraySchemas.f32({ description: "Weather-reduced float precipitation at this phase." }),
        surfaceWetness: TypedArraySchemas.f32({ description: "Weather-reduced member-clamped surface wetness at this phase." }),
        potentialDemand: Type.Array(Type.Number({ minimum: 0 }), { description: "Number-precision demand computed from this phase's temperature and weather-reduced surface wetness." }),
      }, { additionalProperties: false }), { minItems: 1 }),
    }, { additionalProperties: false }),
  ]),
  output: Type.Union([
    Type.Object({
      reduction: Type.Literal("weather-members"),
      precipitation: TypedArraySchemas.f32({ description: "Equal-weight weather precipitation mean without a byte codec or saturation cap." }),
      surfaceWetness: TypedArraySchemas.f32({ description: "Equal-weight mean of already-clamped member surface wetness." }),
    }, { additionalProperties: false }),
    Type.Object({
      reduction: Type.Literal("annual"),
      precipitation: TypedArraySchemas.f32({ description: "Calendar-weighted annual deposited model water without saturation." }),
      surfaceWetness: TypedArraySchemas.f32({ description: "Calendar-weighted annual mean of member-clamped surface wetness." }),
      potentialDemand: TypedArraySchemas.f32({ description: "Calendar-weighted mean of phase-resolved demand, not demand at annual-mean temperature." }),
      precipitationAmplitude: TypedArraySchemas.f32({ description: "Unrounded half-range of float precipitation over all integration phases." }),
      surfaceWetnessAmplitude: TypedArraySchemas.f32({ description: "Unrounded half-range of surface wetness over all integration phases." }),
      rainfallCodec: TypedArraySchemas.u8({ description: "Native rainfall byte, derived once as round(clamp(annual float precipitation,0,200)); never physical supply." }),
    }, { additionalProperties: false }),
  ]),
  strategies: [phaseReduction],
});
