import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticReefPlacementsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planAquaticReefPlacements = createOp(PlanAquaticReefPlacementsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default planAquaticReefPlacements;

