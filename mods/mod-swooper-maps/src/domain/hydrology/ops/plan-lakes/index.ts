import { createOp } from "@swooper/mapgen-core/authoring";

import PlanLakesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Op-local registration keeps the lake strategy contract beside the code that
 * owns it. Domain-level config remains a thin facade for recipe-facing knobs.
 */
const planLakes = createOp(PlanLakesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default planLakes;
