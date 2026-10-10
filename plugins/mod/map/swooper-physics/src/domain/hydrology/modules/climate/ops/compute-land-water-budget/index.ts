import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandWaterBudgetContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Derives terrestrial moisture and aridity from supplied rainfall, humidity, and demand. */
export default createOp(ComputeLandWaterBudgetContract, { strategies });
