import ComputeShelfMaskContract from "./compute-shelf-mask/contract.js";

/** Shelf operation contracts keyed for exact branch composition. */
const contracts = { computeShelfMask: ComputeShelfMaskContract } as const;
export default contracts;
