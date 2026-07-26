import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicsCurrentContract from "./contract.js";
import { newestEraCompositeStrategy } from "./strategies/index.js";

const computeTectonicsCurrent = createOp(ComputeTectonicsCurrentContract, {
  strategies: {
    "newest-era-composite": newestEraCompositeStrategy,
  },
});

export default computeTectonicsCurrent;
