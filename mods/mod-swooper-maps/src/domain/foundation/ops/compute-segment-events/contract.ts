import { Type, defineOp } from "@swooper/mapgen-core/authoring";

import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationTectonicSegmentsSchema } from "../compute-tectonic-segments/contract.js";
import { TectonicEventsSchema } from "../../lib/tectonics/internal-contract.js";

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
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeSegmentEventsContract;
