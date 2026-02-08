import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementTaigaContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planVegetatedPlacementTaiga = createOp(PlanVegetatedPlacementTaigaContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetatedPlacementTaiga;

