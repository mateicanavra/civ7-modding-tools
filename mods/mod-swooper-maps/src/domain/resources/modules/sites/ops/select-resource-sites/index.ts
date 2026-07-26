import { createOp } from "@swooper/mapgen-core/authoring";

import SelectResourceSitesContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Selects deterministic resource intents from typed demand, habitat, policy, landmass, and seed
 * inputs while preserving provenance and shortfalls. Exclusion gates candidates; affinity only
 * biases selection scores, and both settings flow to bounded support adjustment.
 */
export default createOp(SelectResourceSitesContract, { strategies });
