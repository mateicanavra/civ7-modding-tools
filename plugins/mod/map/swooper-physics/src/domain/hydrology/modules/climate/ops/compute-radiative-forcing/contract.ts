import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { SolarHarmonicsSchema } from "../../model/atoms/solar-harmonics.schema.js";
import latitudeInsolationDefinition from "./strategies/latitude-insolation/config.js";
import dailySolarFourierDefinition from "./strategies/daily-solar-fourier/config.js";

/** Owns legacy latitude forcing and explicitly dimensionless daily-mean solar harmonics. */
const ComputeRadiativeForcingContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-radiative-forcing",
  input: Type.Union([
    Type.Object(
      {
        model: Type.Literal("latitude-insolation"),
        width: Type.Integer({ minimum: 1 }),
        height: Type.Integer({ minimum: 1 }),
        latitudeByRow: TypedArraySchemas.f32({
          cardinality: ["height"],
          description: "Legacy shifted latitude in degrees.",
        }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        model: Type.Literal("daily-solar-fourier"),
        width: Type.Integer({ minimum: 1 }),
        height: Type.Integer({ minimum: 1 }),
        latitudeByRow: TypedArraySchemas.f32({
          cardinality: ["height"],
          description: "True geographic latitude in [-90, 90] degrees, without seasonal shifting.",
        }),
        axialTiltDeg: Type.Number({ minimum: 0, maximum: 90 }),
      },
      { additionalProperties: false }
    ),
  ]),
  output: Type.Union([
    Type.Object(
      {
        model: Type.Literal("latitude-insolation"),
        insolation: TypedArraySchemas.f32({ description: "Legacy per-tile insolation proxy." }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        model: Type.Literal("daily-solar-fourier"),
        phaseOrigin: Type.Literal("northward-equinox"),
        solarByRow: Type.Array(SolarHarmonicsSchema, {
          description:
            "One binary64 harmonic record per geographic row; mean(q), 2*mean(q*cos(k phase)), 2*mean(q*sin(k phase)).",
        }),
      },
      { additionalProperties: false }
    ),
  ]),
  defaultStrategy: "latitude-insolation",
  strategies: [latitudeInsolationDefinition, dailySolarFourierDefinition],
});

export default ComputeRadiativeForcingContract;
