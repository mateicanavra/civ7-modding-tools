import { createOp } from "@swooper/mapgen-core/authoring";

import PlanIslandChainsContract from "./contract.js";
import { plateAwareVolcanicStrategy } from "./strategies/index.js";

const planIslandChains = createOp(PlanIslandChainsContract, {
  strategies: {
    "plate-aware-volcanic": plateAwareVolcanicStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planIslandChains;
