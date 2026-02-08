import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationTaigaContract from "./contract.js";
import { clusteredStrategy, defaultStrategy } from "./strategies/index.js";

const planVegetationTaiga = createOp(PlanVegetationTaigaContract, {
  strategies: {
    default: defaultStrategy,
    clustered: clusteredStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetationTaiga;

