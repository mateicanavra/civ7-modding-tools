import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeBaseTopographyContract from "./contract.js";
import { tectonicReliefStrategy } from "./strategies/index.js";

const computeBaseTopography = createOp(ComputeBaseTopographyContract, {
  strategies: {
    "tectonic-relief": tectonicReliefStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeBaseTopography;
