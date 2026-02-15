import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicProvenanceContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeTectonicProvenanceOp = createOp(ComputeTectonicProvenanceContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeTectonicProvenanceOp;
