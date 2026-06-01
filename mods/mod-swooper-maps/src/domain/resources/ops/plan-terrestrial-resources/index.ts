import { createOp } from "@swooper/mapgen-core/authoring";

import PlanTerrestrialResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planTerrestrialResources = createOp(PlanTerrestrialResourcesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planTerrestrialResources;
