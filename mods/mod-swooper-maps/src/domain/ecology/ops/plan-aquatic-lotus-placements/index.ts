import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticLotusPlacementsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planAquaticLotusPlacements = createOp(PlanAquaticLotusPlacementsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default planAquaticLotusPlacements;

