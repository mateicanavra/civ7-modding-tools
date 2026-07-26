import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandWaterBudgetContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Balances rainfall, humidity, and temperature into potential evapotranspiration and terrestrial aridity. */
export default createOp(ComputeLandWaterBudgetContract, { strategies });
