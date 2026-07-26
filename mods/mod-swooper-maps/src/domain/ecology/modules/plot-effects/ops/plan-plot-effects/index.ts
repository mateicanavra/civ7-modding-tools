import { createOp } from "@swooper/mapgen-core/authoring";

import PlanPlotEffectsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Ranks snow, sand, burned, and jungle suitability into deterministic coverage budgets and optional hazard intent. */
export default createOp(PlanPlotEffectsContract, { strategies });
