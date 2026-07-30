import { createOp } from "@swooper/mapgen-core/authoring";

import PlanNaturalWondersContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Deterministically selects natural-wonder intent and fallback anchors from catalog constraints
 * and map truth. It never stamps Civ7 features.
 */
const planNaturalWonders = createOp(PlanNaturalWondersContract, { strategies });

export default planNaturalWonders;
