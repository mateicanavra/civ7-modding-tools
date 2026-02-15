import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import { FoundationMantleForcingSchema } from "../compute-mantle-forcing/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { TectonicEventsSchema } from "../compute-tectonic-history/lib/internal-contract.js";

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
