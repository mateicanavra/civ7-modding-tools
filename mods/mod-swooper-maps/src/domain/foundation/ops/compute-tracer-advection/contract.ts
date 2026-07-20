import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationMantleForcingSchema } from "../../artifacts/mantle-forcing.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import { Schema as FoundationTectonicEraFieldsInternalListSchema } from "../../artifacts/tectonic-era-fields.artifact.js";
import { Schema as TracerIndexByEraSchema } from "../../artifacts/tracer-index-by-era.artifact.js";

const ComputeTracerAdvectionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tracer-advection",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      mantleForcing: FoundationMantleForcingSchema,
      eras: FoundationTectonicEraFieldsInternalListSchema,
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tracerIndex: TracerIndexByEraSchema,
    },
    {
      additionalProperties: false,
      description:
        "Oldest-to-newest source-cell maps for provenance advection: era zero is identity, and each later map selects a prior-era cell using boundary drift with mantle fallback.",
    }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTracerAdvectionContract;
