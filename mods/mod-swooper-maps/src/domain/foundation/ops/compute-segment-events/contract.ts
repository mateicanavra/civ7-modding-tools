import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as FoundationMeshArtifact } from "../../artifacts/mesh.artifact.js";
import { artifact as TectonicEventsArtifact } from "../../artifacts/tectonic-events.artifact.js";
import { artifact as FoundationTectonicSegmentsArtifact } from "../../artifacts/tectonic-segments.artifact.js";
import { CrustSchema as FoundationCrustSchema } from "../../model/schemas/crust.schema.js";

const ComputeSegmentEventsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-segment-events",
  input: Type.Object(
    {
      mesh: FoundationMeshArtifact.schema,
      crust: FoundationCrustSchema,
      segments: FoundationTectonicSegmentsArtifact.schema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      events: TectonicEventsArtifact.schema,
    },
    {
      additionalProperties: false,
      description:
        "Boundary events for one reconstructed era, translating classified plate segments and crust pairing into convergence, rift, transform, and fracture emissions.",
    }
  ),
  strategies: {
    "boundary-derived": Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeSegmentEventsContract;
