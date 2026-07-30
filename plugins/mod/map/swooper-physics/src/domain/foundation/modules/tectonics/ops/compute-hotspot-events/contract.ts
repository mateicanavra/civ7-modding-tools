import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { TectonicEventSchema } from "../../model/atoms/tectonic-event.schema.js";
import upwellingHotspotsDefinition from "./strategies/upwelling-hotspots/config.js";

/** Contract for deriving intraplate hotspot events from mantle upwelling and era membership. */
const ComputeHotspotEventsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-hotspot-events",
  input: Type.Object(
    {
      mesh: Type.Object(
        { cellCount: Type.Integer({ minimum: 1 }) },
        { additionalProperties: false }
      ),
      mantleForcing: Type.Object(
        {
          upwellingClass: TypedArraySchemas.i8({ cardinality: ["mesh.cellCount"] }),
          forcingMag: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          stress: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          forcingU: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          forcingV: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      eraPlateId: TypedArraySchemas.i16({ cardinality: ["mesh.cellCount"] }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      events: Type.Array(TectonicEventSchema),
    },
    {
      additionalProperties: false,
      description:
        "Intraplate hotspot events for one reconstructed era, seeded at mantle upwellings and tagged with origin plates before merging with boundary events.",
    }
  ),
  strategies: [upwellingHotspotsDefinition],
});

export default ComputeHotspotEventsContract;
