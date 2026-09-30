import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { AtmosphericSampleSchema } from "../../model/atoms/atmospheric-sample.schema.js";
import { ClimateSamplingModelSchema } from "../../model/atoms/climate-phase.schema.js";
import phaseReduction from "./strategies/phase-reduction/config.js";

/** Owns tagged atmospheric reductions, keeping thermal centering distinct from weather and annual means. */
export default defineOp({
  kind: "compute",
  id: "hydrology/compute-atmospheric-aggregate",
  input: Type.Union([
    Type.Object({
      width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
      reduction: Type.Literal("thermal-centering"), model: ClimateSamplingModelSchema,
      weights: Type.Array(Type.Number({ exclusiveMinimum: 0 }), { minItems: 1 }),
      samples: Type.Array(TypedArraySchemas.f32({ description: "Sea-level temperature at an atmosphere phase." }), { minItems: 1 }),
    }, { additionalProperties: false }),
    Type.Object({
      width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
      reduction: Type.Literal("ground-thermal-mean"),
      samples: Type.Array(TypedArraySchemas.f32({ description: "Legacy ground temperature at a snapshot phase." }), { minItems: 1 }),
    }, { additionalProperties: false }),
    Type.Object({
      width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
      reduction: Type.Literal("weather-members"),
      samples: Type.Array(AtmosphericSampleSchema, { minItems: 1 }),
    }, { additionalProperties: false }),
    Type.Object({
      width: Type.Integer({ minimum: 1 }), height: Type.Integer({ minimum: 1 }),
      reduction: Type.Literal("annual"), model: ClimateSamplingModelSchema,
      weights: Type.Array(Type.Number({ exclusiveMinimum: 0 }), { minItems: 1 }),
      samples: Type.Array(AtmosphericSampleSchema, { minItems: 1 }),
    }, { additionalProperties: false }),
  ]),
  output: Type.Union([
    Type.Object({
      reduction: Type.Union([Type.Literal("thermal-centering"), Type.Literal("ground-thermal-mean")]),
      meanSurfaceTemperatureC: TypedArraySchemas.f32({ description: "Atmospheric centering or legacy ground annual temperature, as tagged." }),
    }, { additionalProperties: false }),
    Type.Object({
      reduction: Type.Union([Type.Literal("weather-members"), Type.Literal("annual")]),
      pressure: TypedArraySchemas.f32({ description: "Reduced pressure anomaly in hPa." }),
      windU: TypedArraySchemas.i8({ description: "Reduced zonal wind." }),
      windV: TypedArraySchemas.i8({ description: "Reduced meridional wind." }),
      currentU: TypedArraySchemas.i8({ description: "Reduced zonal current." }),
      currentV: TypedArraySchemas.i8({ description: "Reduced meridional current." }),
    }, { additionalProperties: false }),
  ]),
  strategies: [phaseReduction],
});
