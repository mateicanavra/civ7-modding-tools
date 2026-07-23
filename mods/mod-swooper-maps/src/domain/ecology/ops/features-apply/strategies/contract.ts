import strictSingleOccupancy from "./strict-single-occupancy/contract.js";

/** Merges feature-family plans into one deterministic placement sequence and rejects multiple features on the same tile. Strategy contracts vary authored policy without redefining the operation input or output. */
export default [strictSingleOccupancy] as const;
