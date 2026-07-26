import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTracerAdvectionContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Advects tracer identities across reconstructed eras for later tectonic-lineage recovery. */
const computeTracerAdvection = createOp(ComputeTracerAdvectionContract, {
  strategies,
});

export default computeTracerAdvection;
