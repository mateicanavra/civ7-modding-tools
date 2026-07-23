import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as FoundationMantleForcingArtifact } from "../../artifacts/mantle-forcing.artifact.js";
import { artifact as FoundationMeshArtifact } from "../../artifacts/mesh.artifact.js";
import { artifact as TectonicEventsArtifact } from "../../artifacts/tectonic-events.artifact.js";

const ComputeHotspotEventsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-hotspot-events",
  input: Type.Object(
    {
      mesh: FoundationMeshArtifact.schema,
      mantleForcing: FoundationMantleForcingArtifact.schema,
      eraPlateId: TypedArraySchemas.i16({ cardinality: null }),
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
        "Intraplate hotspot events for one reconstructed era, seeded at mantle upwellings and tagged with origin plates before merging with boundary events.",
    }
  ),
  strategies: {
    "upwelling-hotspots": Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeHotspotEventsContract;
