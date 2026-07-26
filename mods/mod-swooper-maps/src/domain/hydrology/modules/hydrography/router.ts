import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import accumulateDischarge from "./ops/accumulate-discharge/index.js";
import computeDrainageRouting from "./ops/compute-drainage-routing/index.js";
import classifyRiverNetwork from "./ops/classify-river-network/index.js";
import planLakes from "./ops/plan-lakes/index.js";
import projectRiverNetwork from "./ops/project-river-network/index.js";

/** Executable Hydrology hydrography branch. */
const hydrography = createDomainSubdomainRouter(contract, {
  computeDrainageRouting,
  accumulateDischarge,
  projectRiverNetwork,
  planLakes,
  classifyRiverNetwork,
});

export default hydrography;
