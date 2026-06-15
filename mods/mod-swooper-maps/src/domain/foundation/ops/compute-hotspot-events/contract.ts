import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { TectonicEventsSchema } from "../../lib/tectonics/internal-contract.js";
import { FoundationMantleForcingSchema } from "../compute-mantle-forcing/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";

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
