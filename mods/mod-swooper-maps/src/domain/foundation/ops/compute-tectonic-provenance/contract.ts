import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as FoundationMeshArtifact } from "../../artifacts/mesh.artifact.js";
import { artifact as FoundationPlateGraphArtifact } from "../../artifacts/plate-graph.artifact.js";
import { artifact as FoundationTectonicEraFieldsInternalListArtifact } from "../../artifacts/tectonic-era-fields.artifact.js";
import { artifact as FoundationTectonicProvenanceArtifact } from "../../artifacts/tectonic-provenance.artifact.js";
import { artifact as TracerIndexByEraArtifact } from "../../artifacts/tracer-index-by-era.artifact.js";

const ComputeTectonicProvenanceContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-provenance",
  input: Type.Object(
    {
      mesh: FoundationMeshArtifact.schema,
      plateGraph: FoundationPlateGraphArtifact.schema,
      eras: FoundationTectonicEraFieldsInternalListArtifact.schema,
      tracerIndex: TracerIndexByEraArtifact.schema,
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicProvenance: FoundationTectonicProvenanceArtifact.schema,
    },
    {
      additionalProperties: false,
      description:
        "Per-cell tectonic provenance linking present locations to advected origin eras and plates, crust age, and the most recent boundary encounter.",
    }
  ),
  strategies: {
    "advected-lineage": Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTectonicProvenanceContract;
