import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as TectonicEventsSchema } from "../../artifacts/tectonic-events.artifact.js";
import { Schema as FoundationMantleForcingSchema } from "../../artifacts/mantle-forcing.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";

const ComputeHotspotEventsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-hotspot-events",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      mantleForcing: FoundationMantleForcingSchema,
      eraPlateId: TypedArraySchemas.i16({ shape: null }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      events: TectonicEventsSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeHotspotEventsContract;
