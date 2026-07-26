import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Chooses the strongest forest-family habitat per unoccupied land tile under family-specific confidence floors. */
export default createOp(PlanVegetationContract, { strategies });
