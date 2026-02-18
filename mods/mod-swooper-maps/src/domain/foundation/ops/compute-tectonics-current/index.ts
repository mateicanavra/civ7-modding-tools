import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicsCurrentContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeTectonicsCurrent = createOp(ComputeTectonicsCurrentContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeTectonicsCurrent;
