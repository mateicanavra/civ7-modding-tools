import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { SolarHarmonicsSchema } from "../../model/atoms/solar-harmonics.schema.js";
import periodicResponseDefinition from "./strategies/periodic-response/config.js";

/** Owns thermal response, independent sea/ground clipping, and the explicit annual ground proxy. */
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
          "Requested equinox-relative phases in turns, aligned with weights and output samples. Enabled regional response requires exact ordered identity with its producer phases.",
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
      regionalResponse: Type.Optional(Type.Object({
        gainC: Type.Number({ minimum: 0, description: "Unidentified regional anomaly gain; zero preserves the incumbent." }),
        phases: Type.Array(Type.Number({ minimum: 0, exclusiveMaximum: 1 }), {
          minItems: 1,
          description: "Frozen sorted uniform cyclic producer phases, exactly matching requested thermal phases when response is enabled; P/D is not interpolated between phases.",
        }),
        precipitationByPhase: Type.Array(TypedArraySchemas.f32({ cardinality: ["width", "height"] }), { minItems: 1 }),
        demandByPhase: Type.Array(Type.Array(Type.Number({ minimum: 0 }), { minItems: 1 }), { minItems: 1 }),
        latitudeByRow: TypedArraySchemas.f32({ cardinality: ["height"] }),
        axialTiltDeg: Type.Number({ minimum: 0, maximum: 90 }),
        tMinC: Type.Number(),
        tMaxC: Type.Number(),
      }, {
        additionalProperties: false,
        description: "Frozen producer-phase model P/D evidence, not observed precipitation or soil storage. Enabled response requires strictly positive source demand on original land and uses the admitted request weights.",
      })),
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
          "Float32 publication of the dense clipped incumbent ground mean, or with enabled response its bounded sum with the weighted producer-phase clipped-ground departure, reduced before Float32 rounding. Cells with zero anomaly at every producer phase retain exact incumbent annual publications. Not a corrected continuous-cycle integral or observation average.",
      }),
      annualUnclippedSurfaceTemperatureC: TypedArraySchemas.f32({
        description:
          "Float32 publication of the dense raw incumbent ground mean plus enabled weighted producer-phase raw anomalies, reduced in binary64 and retaining prescribed SST over original water. Cells with zero anomaly at every producer phase retain the exact incumbent raw publication.",
      }),
      annualClippingDeltaC: TypedArraySchemas.f32({
        description: "Annual ground proxy minus raw annual proxy, calculated in binary64 before Float32 publication. Exactly inert cells retain the incumbent diagnostic; changed-response cells include inherited and producer-phase clipping plus aggregate saturation, not the clipping integral of a corrected continuous cycle.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [periodicResponseDefinition],
});

export default ComputeThermalStateContract;
