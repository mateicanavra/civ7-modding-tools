import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSculptContinentalMarginContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeSculptContinentalMargin = createOp(ComputeSculptContinentalMarginContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeSculptContinentalMargin;
