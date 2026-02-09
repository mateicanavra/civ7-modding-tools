import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationTaigaContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreVegetationTaiga = createOp(ScoreVegetationTaigaContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationTaiga;

