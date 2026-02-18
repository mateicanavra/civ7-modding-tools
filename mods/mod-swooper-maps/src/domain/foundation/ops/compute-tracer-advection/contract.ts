import { Type, defineOp } from "@swooper/mapgen-core/authoring";

import { FoundationMantleForcingSchema } from "../compute-mantle-forcing/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import {
  FoundationTectonicEraFieldsInternalListSchema,
  TracerIndexByEraSchema,
} from "../../lib/tectonics/internal-contract.js";

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
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTracerAdvectionContract;
