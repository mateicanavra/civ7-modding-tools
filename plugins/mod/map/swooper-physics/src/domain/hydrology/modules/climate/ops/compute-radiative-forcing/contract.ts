import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { SolarHarmonicsSchema } from "../../model/atoms/solar-harmonics.schema.js";
import dailySolarFourierDefinition from "./strategies/daily-solar-fourier/config.js";

/** Owns explicitly dimensionless daily-mean solar harmonics at true geographic latitude. */
const ComputeRadiativeForcingContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-radiative-forcing",
  input: Type.Object(
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
  output: Type.Object(
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
  strategies: [dailySolarFourierDefinition],
});

export default ComputeRadiativeForcingContract;
