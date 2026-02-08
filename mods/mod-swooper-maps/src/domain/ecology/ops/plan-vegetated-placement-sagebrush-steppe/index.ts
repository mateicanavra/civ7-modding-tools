import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSagebrushSteppeContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planVegetatedPlacementSagebrushSteppe = createOp(PlanVegetatedPlacementSagebrushSteppeContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetatedPlacementSagebrushSteppe;

