import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationCrustSchema } from "../../artifacts/crust.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as TectonicEventsSchema } from "../../artifacts/tectonic-events.artifact.js";
import { Schema as FoundationTectonicSegmentsSchema } from "../../artifacts/tectonic-segments.artifact.js";

const ComputeSegmentEventsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-segment-events",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      crust: FoundationCrustSchema,
      segments: FoundationTectonicSegmentsSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      events: TectonicEventsSchema,
    },
    {
      additionalProperties: false,
      description:
        "Boundary events for one reconstructed era, translating classified plate segments and crust pairing into convergence, rift, transform, and fracture emissions.",
    }
  ),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeSegmentEventsContract;
