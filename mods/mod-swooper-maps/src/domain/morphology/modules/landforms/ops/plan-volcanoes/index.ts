import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVolcanoesContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Ranks plate-boundary and hotspot candidates into a spaced volcano placement plan. */
const planVolcanoes = createOp(PlanVolcanoesContract, { strategies });

export default planVolcanoes;
