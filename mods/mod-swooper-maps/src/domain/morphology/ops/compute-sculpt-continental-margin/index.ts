import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSculptContinentalMarginContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Sculpts continental aprons, breaks, and slopes from crust and boundary evidence. */
const computeSculptContinentalMargin = createOp(ComputeSculptContinentalMarginContract, {
  strategies,
});

export default computeSculptContinentalMargin;
