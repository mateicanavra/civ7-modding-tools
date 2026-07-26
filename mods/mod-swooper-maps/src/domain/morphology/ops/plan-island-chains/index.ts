import { createOp } from "@swooper/mapgen-core/authoring";

import PlanIslandChainsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Plans deterministic volcanic island-chain terrain edits beyond established landmasses. */
const planIslandChains = createOp(PlanIslandChainsContract, { strategies });

export default planIslandChains;
