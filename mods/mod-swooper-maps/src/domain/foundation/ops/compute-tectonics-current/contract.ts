import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import { FoundationTectonicsSchema } from "../compute-tectonic-history/contract.js";
import { FoundationTectonicEraFieldsInternalSchema } from "../compute-tectonic-history/lib/internal-contract.js";

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
