import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicProvenanceContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Reconstructs tectonic lineage and reset provenance from the complete era and tracer history. */
const computeTectonicProvenanceOp = createOp(ComputeTectonicProvenanceContract, {
  strategies,
});

export default computeTectonicProvenanceOp;
