import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTracerAdvectionContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeTracerAdvection = createOp(ComputeTracerAdvectionContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeTracerAdvection;
