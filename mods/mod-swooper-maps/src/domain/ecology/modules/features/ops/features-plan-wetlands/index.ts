import { createOp } from "@swooper/mapgen-core/authoring";

import PlanWetlandsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Chooses the strongest wetland-family habitat per unoccupied land tile after substrate-specific scoring. */
export default createOp(PlanWetlandsContract, { strategies });
