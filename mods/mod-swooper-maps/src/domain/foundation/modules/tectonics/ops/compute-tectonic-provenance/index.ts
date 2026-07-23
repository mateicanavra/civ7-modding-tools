import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicProvenanceContract from "./contract.js";
import { advectedLineageStrategy } from "./strategies/index.js";

/** Reconstructs tectonic lineage and reset provenance from the complete era and tracer history. */
const computeTectonicProvenanceOp = createOp(ComputeTectonicProvenanceContract, {
  strategies: {
    "advected-lineage": advectedLineageStrategy,
  },
});

export default computeTectonicProvenanceOp;
