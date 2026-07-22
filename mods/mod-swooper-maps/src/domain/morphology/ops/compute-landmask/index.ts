import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandmaskContract from "./contract.js";
import { tectonicPotentialStrategy } from "./strategies/index.js";

const computeLandmask = createOp(ComputeLandmaskContract, {
  strategies: {
    "tectonic-potential": tectonicPotentialStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeLandmask;
