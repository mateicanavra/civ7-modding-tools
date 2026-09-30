import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ClassifyBasinRiverNetworkContract from "./ops/classify-basin-river-network/contract.js";
import ComputeLocalRunoffContract from "./ops/compute-local-runoff/contract.js";
import ComputeBasinWaterBudgetContract from "./ops/compute-basin-water-budget/contract.js";
import ComputeDrainageBasinsContract from "./ops/compute-drainage-basins/contract.js";
import ComputeBasinNetworkContract from "./ops/compute-basin-network/contract.js";
import ProjectRiverNetworkContract from "./ops/project-river-network/contract.js";

/** Hydrography branch contract for routing, discharge, rivers, and lakes. */
const hydrography = defineDomainSubdomain({
  id: "hydrography",
  ops: {
    computeLocalRunoff: ComputeLocalRunoffContract,
    classifyBasinRiverNetwork: ClassifyBasinRiverNetworkContract,
    computeBasinWaterBudget: ComputeBasinWaterBudgetContract,
    computeDrainageBasins: ComputeDrainageBasinsContract,
    computeBasinNetwork: ComputeBasinNetworkContract,
    projectRiverNetwork: ProjectRiverNetworkContract,
  },
});

export default hydrography;
