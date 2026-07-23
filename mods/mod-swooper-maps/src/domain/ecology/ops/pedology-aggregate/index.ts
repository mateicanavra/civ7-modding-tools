import { createOp } from "@swooper/mapgen-core/authoring";

import AggregatePedologyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Aggregates tile-level soil and fertility evidence into stable grid-cell summaries for downstream inspection. */
export default createOp(AggregatePedologyContract, { strategies });
