import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FoundationTectonicEraFieldsInternalSchema } from "../../lib/tectonics/internal-contract.js";
import { FoundationTectonicsSchema } from "../../lib/tectonics/schemas.js";

const ComputeTectonicsCurrentContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonics-current",
  input: Type.Object(
    {
      newestEra: FoundationTectonicEraFieldsInternalSchema,
      upliftTotal: TypedArraySchemas.u8({ shape: null }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonics: FoundationTectonicsSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTectonicsCurrentContract;
