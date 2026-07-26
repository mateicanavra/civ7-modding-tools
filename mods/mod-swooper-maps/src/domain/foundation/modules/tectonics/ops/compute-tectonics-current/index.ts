import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicsCurrentContract from "./contract.js";
import { newestEraCompositeStrategy } from "./strategies/index.js";

/** Produces the present-day tectonic artifact while retaining cumulative uplift from prior eras. */
const computeTectonicsCurrent = createOp(ComputeTectonicsCurrentContract, {
  strategies: {
    "newest-era-composite": newestEraCompositeStrategy,
  },
});

export default computeTectonicsCurrent;
