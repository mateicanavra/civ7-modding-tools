import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as FoundationTectonicsArtifact } from "../../artifacts/current-tectonics.artifact.js";
import { artifact as FoundationTectonicEraFieldsInternalListArtifact } from "../../artifacts/tectonic-era-fields.artifact.js";

const FoundationTectonicEraFieldsInternalSchema =
  FoundationTectonicEraFieldsInternalListArtifact.schema.items;

const ComputeTectonicsCurrentContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonics-current",
  input: Type.Object(
    {
      newestEra: FoundationTectonicEraFieldsInternalSchema,
      upliftTotal: TypedArraySchemas.u8({ cardinality: null }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonics: FoundationTectonicsArtifact.schema,
    },
    {
      additionalProperties: false,
      description:
        "Mesh-wide present-state tectonic surface combining the newest era's active boundary and deformation signals with cumulative uplift from the full history.",
    }
  ),
  strategies: {
    "newest-era-composite": Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTectonicsCurrentContract;
