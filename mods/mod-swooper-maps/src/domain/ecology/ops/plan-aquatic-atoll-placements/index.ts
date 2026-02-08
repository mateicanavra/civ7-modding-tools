import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticAtollPlacementsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planAquaticAtollPlacements = createOp(PlanAquaticAtollPlacementsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default planAquaticAtollPlacements;

