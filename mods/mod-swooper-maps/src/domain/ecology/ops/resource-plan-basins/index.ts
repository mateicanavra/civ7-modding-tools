import { createOp } from "@swooper/mapgen-core/authoring";
import ResourcePlanBasinsContract from "./contract.js";
import { balancedStrategy, hydroFluvialStrategy, mixedStrategy } from "./strategies/index.js";

/** Resource-basin operation exposing balanced, hydro-fluvial, and mixed bias profiles. */
const planResourceBasins = createOp(ResourcePlanBasinsContract, {
  strategies: {
    balanced: balancedStrategy,
    "hydro-fluvial": hydroFluvialStrategy,
    mixed: mixedStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planResourceBasins;
