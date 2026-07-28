import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { TectonicEventSchema } from "../../model/atoms/tectonic-event.schema.js";
import boundaryDerivedDefinition from "./strategies/boundary-derived/config.js";

/** Contract for converting classified plate-boundary segments into discrete tectonic events. */
const ComputeSegmentEventsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-segment-events",
  input: Type.Object(
    {
      mesh: Type.Object(
        { cellCount: Type.Integer({ minimum: 1 }) },
        { additionalProperties: false }
      ),
      crust: Type.Object(
        { type: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }) },
        { additionalProperties: false }
      ),
      segments: Type.Object(
        {
          segmentCount: Type.Integer({ minimum: 0 }),
          aCell: TypedArraySchemas.i32({ cardinality: ["segments.segmentCount"] }),
          bCell: TypedArraySchemas.i32({ cardinality: ["segments.segmentCount"] }),
          plateA: TypedArraySchemas.i16({ cardinality: ["segments.segmentCount"] }),
          plateB: TypedArraySchemas.i16({ cardinality: ["segments.segmentCount"] }),
          regime: TypedArraySchemas.u8({ cardinality: ["segments.segmentCount"] }),
          polarity: TypedArraySchemas.i8({ cardinality: ["segments.segmentCount"] }),
          compression: TypedArraySchemas.u8({ cardinality: ["segments.segmentCount"] }),
          extension: TypedArraySchemas.u8({ cardinality: ["segments.segmentCount"] }),
          shear: TypedArraySchemas.u8({ cardinality: ["segments.segmentCount"] }),
          volcanism: TypedArraySchemas.u8({ cardinality: ["segments.segmentCount"] }),
          fracture: TypedArraySchemas.u8({ cardinality: ["segments.segmentCount"] }),
          driftU: TypedArraySchemas.i8({ cardinality: ["segments.segmentCount"] }),
          driftV: TypedArraySchemas.i8({ cardinality: ["segments.segmentCount"] }),
        },
        { additionalProperties: false }
      ),
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
        "Boundary events for one reconstructed era, translating classified plate segments and crust pairing into convergence, rift, transform, and fracture emissions.",
    }
  ),
  strategies: [boundaryDerivedDefinition],
});

export default ComputeSegmentEventsContract;
