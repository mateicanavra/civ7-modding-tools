import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTracerAdvectionContract from "./contract.js";
import { boundaryDriftStrategy } from "./strategies/index.js";

const computeTracerAdvection = createOp(ComputeTracerAdvectionContract, {
  strategies: {
    "boundary-drift": boundaryDriftStrategy,
  },
});

export default computeTracerAdvection;
