import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as FoundationMantleForcingArtifact } from "../../artifacts/mantle-forcing.artifact.js";
import { artifact as FoundationMeshArtifact } from "../../artifacts/mesh.artifact.js";
import { artifact as FoundationTectonicEraFieldsInternalListArtifact } from "../../artifacts/tectonic-era-fields.artifact.js";
import { artifact as TracerIndexByEraArtifact } from "../../artifacts/tracer-index-by-era.artifact.js";

const ComputeTracerAdvectionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tracer-advection",
  input: Type.Object(
    {
      mesh: FoundationMeshArtifact.schema,
      mantleForcing: FoundationMantleForcingArtifact.schema,
      eras: FoundationTectonicEraFieldsInternalListArtifact.schema,
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tracerIndex: TracerIndexByEraArtifact.schema,
    },
    {
      additionalProperties: false,
      description:
        "Oldest-to-newest source-cell maps for provenance advection: era zero is identity, and each later map selects a prior-era cell using boundary drift with mantle fallback.",
    }
  ),
  strategies: {
    "boundary-drift": Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTracerAdvectionContract;
