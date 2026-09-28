import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import AccumulateDischargeContract from "./ops/accumulate-discharge/contract.js";
import ClassifyRiverNetworkContract from "./ops/classify-river-network/contract.js";
import ClassifyBasinRiverNetworkContract from "./ops/classify-basin-river-network/contract.js";
import ComputeLocalRunoffContract from "./ops/compute-local-runoff/contract.js";
import ComputeBasinWaterBudgetContract from "./ops/compute-basin-water-budget/contract.js";
import ComputeDrainageBasinsContract from "./ops/compute-drainage-basins/contract.js";
import ComputeDrainageRoutingContract from "./ops/compute-drainage-routing/contract.js";
import ComputeOpenBasinNetworkContract from "./ops/compute-open-basin-network/contract.js";
import PlanLakesContract from "./ops/plan-lakes/contract.js";
import ProjectRiverNetworkContract from "./ops/project-river-network/contract.js";

/** Hydrography branch contract for routing, discharge, rivers, and lakes. */
const hydrography = defineDomainSubdomain({
  id: "hydrography",
  ops: {
    computeLocalRunoff: ComputeLocalRunoffContract,
    classifyBasinRiverNetwork: ClassifyBasinRiverNetworkContract,
    computeBasinWaterBudget: ComputeBasinWaterBudgetContract,
    computeDrainageBasins: ComputeDrainageBasinsContract,
    computeDrainageRouting: ComputeDrainageRoutingContract,
    computeOpenBasinNetwork: ComputeOpenBasinNetworkContract,
    accumulateDischarge: AccumulateDischargeContract,
    projectRiverNetwork: ProjectRiverNetworkContract,
    planLakes: PlanLakesContract,
    classifyRiverNetwork: ClassifyRiverNetworkContract,
  },
});

export default hydrography;
