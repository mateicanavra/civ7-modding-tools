import ComputeGeomorphicCycleContract from "./compute-geomorphic-cycle/contract.js";

/** Erosion operation contracts keyed for exact branch composition. */
const contracts = { computeGeomorphicCycle: ComputeGeomorphicCycleContract } as const;
export default contracts;
