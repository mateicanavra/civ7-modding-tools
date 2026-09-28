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
      landMask: TypedArraySchemas.u8(),
      rainfall: TypedArraySchemas.u8(),
      humidity: TypedArraySchemas.u8(),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      runoff: Type.Array(Type.Number({ minimum: 0 }), {
        description:
          "Map-grid Number-precision precipitation-attributed supply; zero on original marine water and never greater than local rainfall.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [precipitationAttributedDefinition],
});
export default ComputeLocalRunoffContract;
