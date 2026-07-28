import { createOp } from "@swooper/mapgen-core/authoring";

import PlanLakesContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Admits terminal drainage basins as lakes while preserving a bounded share of playable land. */
export default createOp(PlanLakesContract, { strategies });
