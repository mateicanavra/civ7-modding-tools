import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PotentialDemandParametersSchema } from "../../model/atoms/potential-demand.schema.js";
import temperatureHumidityDefinition from "./strategies/temperature-humidity/config.js";

/** Computes empirical atmospheric demand for one admitted climate forcing vintage. */
const ComputePotentialDemandContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-potential-demand",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height." }),
      landMask: TypedArraySchemas.u8({
        description: "Original Morphology land mask (1=land, 0=water); water demand remains zero.",
      }),
      surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
      humidity: TypedArraySchemas.u8({ description: "Humidity (0..255) at the same forcing vintage." }),
      parameters: PotentialDemandParametersSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      pet: Type.Array(Type.Number({ minimum: 0 }), {
        description:
          "Per-tile potential demand in rainfall units. JS numbers retain double precision until the consuming budget computes aridity; public climate fields quantize to Float32 only afterward.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [temperatureHumidityDefinition],
});

export default ComputePotentialDemandContract;
