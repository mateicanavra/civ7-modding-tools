import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import precipitationAttributedDefinition from "./strategies/precipitation-attributed/config.js";

/** Attributes local dry-land supply without scaling, floors, or graph accumulation. */
const ComputeLocalRunoffContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-local-runoff",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      externalWaterMask: TypedArraySchemas.u8(),
      precipitation: TypedArraySchemas.f32({ description: "Finite nonnegative model precipitation, including fractional values above codec saturation." }),
      surfaceWetness: TypedArraySchemas.f32({ description: "Empirical surface wetness in 0..1." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      runoff: Type.Array(Type.Number({ minimum: 0 }), {
        description:
          "Map-grid Number-precision precipitation-attributed supply on all finite ground; zero on prescribed external water and never greater than local model precipitation.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [precipitationAttributedDefinition],
});
export default ComputeLocalRunoffContract;
