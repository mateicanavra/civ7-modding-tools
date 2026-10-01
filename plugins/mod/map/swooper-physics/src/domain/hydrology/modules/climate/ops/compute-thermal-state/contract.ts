import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { SolarHarmonicsSchema } from "../../model/atoms/solar-harmonics.schema.js";
import periodicResponseDefinition from "./strategies/periodic-response/config.js";

/** Owns thermal response, independent sea/ground clipping, and the integrated annual ground datum. */
const ComputeThermalStateContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-thermal-state",
  input: Type.Object(
    {
      model: Type.Literal("periodic-response"),
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      solarByRow: Type.Array(SolarHarmonicsSchema),
      phases: Type.Array(Type.Number({ minimum: 0, exclusiveMaximum: 1 }), {
        minItems: 1,
        description:
          "Requested equinox-relative phases in turns, aligned with weights and output samples.",
      }),
      weights: Type.Array(Type.Number({ exclusiveMinimum: 0, maximum: 1 }), {
        minItems: 1,
        description:
          "Positive normalized climate integration weights, not solar quadrature weights.",
      }),
      elevation: TypedArraySchemas.i16({ cardinality: ["width", "height"] }),
      seaLevel: Type.Number({
        description: "Sea-level datum in model relief units, not meters.",
      }),
      landMask: TypedArraySchemas.u8({ cardinality: ["width", "height"] }),
      sstC: TypedArraySchemas.f32({
        cardinality: ["width", "height"],
        description: "Required prescribed annual SST; water has no seasonal anomaly.",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      model: Type.Literal("periodic-response"),
      samples: Type.Array(
        Type.Object(
          {
            seaLevelTemperatureC: TypedArraySchemas.f32({
              description:
                "Clipped raw sea-level response for pressure; not reconstructed from ground temperature.",
            }),
            surfaceTemperatureC: TypedArraySchemas.f32({
              description:
                "Clipped raw response plus one model-relief lapse for moisture and demand.",
            }),
          },
          { additionalProperties: false }
        )
      ),
      meanSeaLevelTemperatureC: TypedArraySchemas.f32({
        description:
          "Weighted mean of the exact admitted phase samples used for pressure centering.",
      }),
      annualSurfaceTemperatureC: TypedArraySchemas.f32({
        description:
          "Independent dense-cycle mean of clipped ground temperature; never an observation average.",
      }),
      annualUnclippedSurfaceTemperatureC: TypedArraySchemas.f32({
        description:
          "Dense-cycle ground mean before bounds, retaining prescribed SST over water.",
      }),
      annualClippingDeltaC: TypedArraySchemas.f32({
        description: "Dense clipped mean minus dense unclipped mean, before f32 output rounding.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [periodicResponseDefinition],
});

export default ComputeThermalStateContract;
