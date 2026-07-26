import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { TracerIndexSchema } from "../../model/atoms/tracer-index.schema.js";

/**
 * Contract for tracing mesh-cell lineage backward through reconstructed tectonic motion.
 * Its era-indexed tracer atom supplies the stable correspondence required by provenance.
 */
const ComputeTracerAdvectionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tracer-advection",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          neighborsOffsets: TypedArraySchemas.i32({ cardinality: null }),
          neighbors: TypedArraySchemas.i32({ cardinality: null }),
        },
        { additionalProperties: false }
      ),
      mantleForcing: Type.Object(
        {
          forcingU: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          forcingV: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      eras: Type.Array(
        Type.Object(
          {
            boundaryDriftU: TypedArraySchemas.i8({ cardinality: ["mesh.cellCount"] }),
            boundaryDriftV: TypedArraySchemas.i8({ cardinality: ["mesh.cellCount"] }),
          },
          { additionalProperties: false }
        ),
        { minItems: 1 }
      ),
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tracerIndex: Type.Array(TracerIndexSchema, { minItems: 1 }),
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
