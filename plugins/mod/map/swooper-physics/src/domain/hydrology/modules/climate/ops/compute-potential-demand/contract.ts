import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PotentialDemandParametersSchema } from "../../model/atoms/potential-demand.schema.js";
import temperatureWetnessDefinition from "./strategies/temperature-wetness/config.js";

/** Computes empirical atmospheric demand for one admitted climate forcing vintage. */
const ComputePotentialDemandContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-potential-demand",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height." }),
      surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
      surfaceWetness: TypedArraySchemas.f32({ description: "Empirical surface wetness in 0..1 at the same forcing vintage, not independent air humidity." }),
      parameters: PotentialDemandParametersSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      pet: Type.Array(Type.Number({ minimum: 0 }), {
        description:
          "All-surface potential demand in empirical model water units. JS numbers retain double precision until the consuming budget computes aridity; public climate fields quantize to Float32 only afterward.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [temperatureWetnessDefinition],
});

export default ComputePotentialDemandContract;
