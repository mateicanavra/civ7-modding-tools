import AccumulateDischargeContract from "./accumulate-discharge/contract.js";
import ComputeDrainageRoutingContract from "./compute-drainage-routing/contract.js";
import ClassifyRiverNetworkContract from "./classify-river-network/contract.js";
import PlanLakesContract from "./plan-lakes/contract.js";
import ProjectRiverNetworkContract from "./project-river-network/contract.js";

/** Hydrography operation contracts keyed for exact branch composition. */
const contracts = {
  computeDrainageRouting: ComputeDrainageRoutingContract,
  accumulateDischarge: AccumulateDischargeContract,
  projectRiverNetwork: ProjectRiverNetworkContract,
  planLakes: PlanLakesContract,
  classifyRiverNetwork: ClassifyRiverNetworkContract,
} as const;

export default contracts;
