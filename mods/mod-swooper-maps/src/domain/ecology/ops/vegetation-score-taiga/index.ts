import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationTaigaContract from "./contract.js";
import { coldForestStrategy } from "./strategies/index.js";

const scoreVegetationTaiga = createOp(ScoreVegetationTaigaContract, {
  strategies: {
    "cold-forest": coldForestStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationTaiga;
