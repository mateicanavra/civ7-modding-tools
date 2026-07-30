import { createOp } from "@swooper/mapgen-core/authoring";

import PlanReefsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Chooses reef, cold-reef, atoll, or lake-lotus intent while preserving occupancy and lake habitat laws. */
export default createOp(PlanReefsContract, { strategies });
