import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCrustEvolutionContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable crust-evolution operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputeCrustEvolutionContract, { strategies });
