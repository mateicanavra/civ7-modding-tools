import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSagebrushSteppeContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreVegetationSagebrushSteppe = createOp(ScoreVegetationSagebrushSteppeContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationSagebrushSteppe;

