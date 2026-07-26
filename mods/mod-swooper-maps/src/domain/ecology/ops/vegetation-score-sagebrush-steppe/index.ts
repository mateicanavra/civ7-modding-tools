import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSagebrushSteppeContract from "./contract.js";
import { semiaridOpenStrategy } from "./strategies/index.js";

const scoreVegetationSagebrushSteppe = createOp(ScoreVegetationSagebrushSteppeContract, {
  strategies: {
    "semiarid-open": semiaridOpenStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationSagebrushSteppe;
