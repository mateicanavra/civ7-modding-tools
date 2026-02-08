import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationSagebrushSteppeContract from "./contract.js";
import { clusteredStrategy, defaultStrategy } from "./strategies/index.js";

const planVegetationSagebrushSteppe = createOp(PlanVegetationSagebrushSteppeContract, {
  strategies: {
    default: defaultStrategy,
    clustered: clusteredStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetationSagebrushSteppe;

