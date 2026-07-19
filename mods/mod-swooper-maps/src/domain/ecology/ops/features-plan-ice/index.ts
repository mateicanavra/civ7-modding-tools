import { createOp } from "@swooper/mapgen-core/authoring";
import PlanIceContract from "./contract.js";
import { scoreThresholdStrategy } from "./strategies/index.js";

/** Ice-intent operation with one explicit score-threshold strategy. */
const planIce = createOp(PlanIceContract, {
  strategies: {
    "score-threshold": scoreThresholdStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planIce;
