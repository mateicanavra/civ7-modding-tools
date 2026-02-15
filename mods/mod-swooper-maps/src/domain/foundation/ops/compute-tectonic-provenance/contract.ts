import { Type, defineOp } from "@swooper/mapgen-core/authoring";

import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationPlateGraphSchema } from "../compute-plate-graph/contract.js";
import { FoundationTectonicProvenanceSchema } from "../../lib/tectonics/schemas.js";
import {
  FoundationTectonicEraFieldsInternalListSchema,
  TracerIndexByEraSchema,
} from "../../lib/tectonics/internal-contract.js";

const ComputeTectonicProvenanceContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-provenance",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      plateGraph: FoundationPlateGraphSchema,
      eras: FoundationTectonicEraFieldsInternalListSchema,
      tracerIndex: TracerIndexByEraSchema,
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicProvenance: FoundationTectonicProvenanceSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputeTectonicProvenanceContract;
