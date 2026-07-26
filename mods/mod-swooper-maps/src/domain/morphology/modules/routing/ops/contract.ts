import ComputeFlowRoutingContract from "./compute-flow-routing/contract.js";

/** Routing operation contracts keyed for exact branch composition. */
const contracts = { computeFlowRouting: ComputeFlowRoutingContract } as const;
export default contracts;
