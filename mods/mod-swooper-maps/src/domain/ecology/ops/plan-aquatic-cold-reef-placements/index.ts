import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticColdReefPlacementsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planAquaticColdReefPlacements = createOp(PlanAquaticColdReefPlacementsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default planAquaticColdReefPlacements;

