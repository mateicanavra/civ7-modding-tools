import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSculptContinentalMarginContract from "./contract.js";
import { crustBreakProfileStrategy } from "./strategies/index.js";

const computeSculptContinentalMargin = createOp(ComputeSculptContinentalMarginContract, {
  strategies: {
    "crust-break-profile": crustBreakProfileStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeSculptContinentalMargin;
