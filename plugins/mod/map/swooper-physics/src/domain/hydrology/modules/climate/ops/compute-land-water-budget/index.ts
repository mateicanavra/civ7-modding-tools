import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandWaterBudgetContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Balances supplied demand against terrestrial rainfall, humidity, and riparian moisture. */
export default createOp(ComputeLandWaterBudgetContract, { strategies });
