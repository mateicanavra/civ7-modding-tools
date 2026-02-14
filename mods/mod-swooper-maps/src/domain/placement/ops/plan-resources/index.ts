import { createOp } from "@swooper/mapgen-core/authoring";

import PlanResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planResources = createOp(PlanResourcesContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planResources;
