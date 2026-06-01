import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planAquaticResources = createOp(PlanAquaticResourcesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planAquaticResources;
