import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import AccumulateDischargeContract from "./ops/accumulate-discharge/contract.js";
import ComputeDrainageRoutingContract from "./ops/compute-drainage-routing/contract.js";
import ClassifyRiverNetworkContract from "./ops/classify-river-network/contract.js";
import PlanLakesContract from "./ops/plan-lakes/contract.js";
import ProjectRiverNetworkContract from "./ops/project-river-network/contract.js";

/** Hydrography branch contract for routing, discharge, rivers, and lakes. */
const hydrography = defineDomainSubdomain({
  id: "hydrography",
  ops: {
    computeDrainageRouting: ComputeDrainageRoutingContract,
    accumulateDischarge: AccumulateDischargeContract,
    projectRiverNetwork: ProjectRiverNetworkContract,
    planLakes: PlanLakesContract,
    classifyRiverNetwork: ClassifyRiverNetworkContract,
  },
});

export default hydrography;
