import rankedCoverage from "./ranked-coverage/index.js";

/** Ranks snow, sand, burned, and jungle suitability into deterministic coverage budgets and optional hazard intent. Implementations available to the recipe's semantic strategy selection. */
export default [rankedCoverage] as const;
