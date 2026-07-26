import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicProvenanceContract from "./contract.js";
import { advectedLineageStrategy } from "./strategies/index.js";

const computeTectonicProvenanceOp = createOp(ComputeTectonicProvenanceContract, {
  strategies: {
    "advected-lineage": advectedLineageStrategy,
  },
});

export default computeTectonicProvenanceOp;
