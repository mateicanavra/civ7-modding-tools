import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicsCurrentContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Produces the present-day tectonic artifact while retaining cumulative uplift from prior eras. */
const computeTectonicsCurrent = createOp(ComputeTectonicsCurrentContract, {
  strategies,
});

export default computeTectonicsCurrent;
