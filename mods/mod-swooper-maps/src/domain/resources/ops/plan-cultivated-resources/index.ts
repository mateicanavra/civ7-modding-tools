import { createOp } from "@swooper/mapgen-core/authoring";

import PlanCultivatedResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planCultivatedResources = createOp(PlanCultivatedResourcesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planCultivatedResources;
