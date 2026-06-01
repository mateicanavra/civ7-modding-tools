import { createOp } from "@swooper/mapgen-core/authoring";

import PlanGeologicalResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planGeologicalResources = createOp(PlanGeologicalResourcesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planGeologicalResources;
