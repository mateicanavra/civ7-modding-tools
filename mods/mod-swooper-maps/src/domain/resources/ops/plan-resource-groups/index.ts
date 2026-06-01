import { createOp } from "@swooper/mapgen-core/authoring";

import PlanResourceGroupsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planResourceGroups = createOp(PlanResourceGroupsContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planResourceGroups;
