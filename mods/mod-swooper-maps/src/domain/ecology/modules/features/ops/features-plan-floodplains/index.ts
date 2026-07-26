import { createOp } from "@swooper/mapgen-core/authoring";

import PlanFloodplainsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Selects the strongest admitted floodplain family for each unoccupied tile from physical suitability evidence. */
export default createOp(PlanFloodplainsContract, { strategies });
