import gridCellSummary from "./grid-cell-summary/index.js";

/** Aggregates tile-level soil and fertility evidence into stable grid-cell summaries for downstream inspection. Implementations available to the recipe's semantic strategy selection. */
export default [gridCellSummary] as const;
