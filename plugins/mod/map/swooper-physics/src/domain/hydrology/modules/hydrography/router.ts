import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import accumulateDischarge from "./ops/accumulate-discharge/index.js";
import classifyRiverNetwork from "./ops/classify-river-network/index.js";
import computeDrainageRouting from "./ops/compute-drainage-routing/index.js";
import planLakes from "./ops/plan-lakes/index.js";
import projectRiverNetwork from "./ops/project-river-network/index.js";

/**
 * Canonically binds the Hydrography contract to drainage, discharge, river-network, and lake
 * planning implementations consumed by map-hydrology and map-rivers. The Hydrology router is the
 * sole executable aggregate; step authoring continues to reference the contract.
 */
const hydrography = createDomainSubdomainRouter(contract, {
  computeDrainageRouting,
  accumulateDischarge,
  projectRiverNetwork,
  planLakes,
  classifyRiverNetwork,
});

export default hydrography;
