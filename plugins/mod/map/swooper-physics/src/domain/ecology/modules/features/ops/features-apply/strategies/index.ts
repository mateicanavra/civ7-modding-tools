import strictSingleOccupancy from "./strict-single-occupancy/index.js";

/** Merges feature-family plans into one deterministic placement sequence and rejects multiple features on the same tile. Implementations available to the recipe's semantic strategy selection. */
export default [strictSingleOccupancy] as const;
