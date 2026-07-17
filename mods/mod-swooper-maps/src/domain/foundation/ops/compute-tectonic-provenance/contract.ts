import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as FoundationPlateGraphSchema } from "../../artifacts/plate-graph.artifact.js";
import { Schema as FoundationTectonicEraFieldsInternalListSchema } from "../../artifacts/tectonic-era-fields.artifact.js";
import { Schema as FoundationTectonicProvenanceSchema } from "../../artifacts/tectonic-provenance.artifact.js";
import { Schema as TracerIndexByEraSchema } from "../../artifacts/tracer-index-by-era.artifact.js";

const ComputeTectonicProvenanceContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-provenance",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      plateGraph: FoundationPlateGraphSchema,
      eras: FoundationTectonicEraFieldsInternalListSchema,
      tracerIndex: TracerIndexByEraSchema,
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicProvenance: FoundationTectonicProvenanceSchema,
    },
    {
      additionalProperties: false,
      description:
        "Per-cell tectonic provenance linking present locations to advected origin eras and plates, crust age, and the most recent boundary encounter.",
    }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTectonicProvenanceContract;
