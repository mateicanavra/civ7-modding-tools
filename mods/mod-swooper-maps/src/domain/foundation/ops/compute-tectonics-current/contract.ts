import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationTectonicsSchema } from "../../artifacts/current-tectonics.artifact.js";
import { Schema as FoundationTectonicEraFieldsInternalListSchema } from "../../artifacts/tectonic-era-fields.artifact.js";

const FoundationTectonicEraFieldsInternalSchema =
  FoundationTectonicEraFieldsInternalListSchema.items;

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
    {
      additionalProperties: false,
      description:
        "Mesh-wide present-state tectonic surface combining the newest era's active boundary and deformation signals with cumulative uplift from the full history.",
    }
  ),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTectonicsCurrentContract;
