import habitatConfidence from "./habitat-confidence/index.js";

/** Chooses the strongest forest-family habitat per unoccupied land tile under family-specific confidence floors. Implementations available to the recipe's semantic strategy selection. */
export default [habitatConfidence] as const;
