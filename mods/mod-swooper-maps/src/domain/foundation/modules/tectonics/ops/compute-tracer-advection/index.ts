import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTracerAdvectionContract from "./contract.js";
import { boundaryDriftStrategy } from "./strategies/index.js";

/** Advects tracer identities across reconstructed eras for later tectonic-lineage recovery. */
const computeTracerAdvection = createOp(ComputeTracerAdvectionContract, {
  strategies: {
    "boundary-drift": boundaryDriftStrategy,
  },
});

export default computeTracerAdvection;
