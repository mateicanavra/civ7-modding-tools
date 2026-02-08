import { createOp } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementTundraBogContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planWetPlacementTundraBog = createOp(PlanWetPlacementTundraBogContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planWetPlacementTundraBog;

