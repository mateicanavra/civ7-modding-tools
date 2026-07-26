import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planAquaticResources from "./ops/plan-aquatic-resources/index.js";
import planCultivatedResources from "./ops/plan-cultivated-resources/index.js";
import planGeologicalResources from "./ops/plan-geological-resources/index.js";
import planResourceGroups from "./ops/plan-resource-groups/index.js";
import planTerrestrialResources from "./ops/plan-terrestrial-resources/index.js";
import resolveResourceDemands from "./ops/resolve-resource-demands/index.js";

/**
 * Canonically binds the Demand contract to family planning, reconciliation, and symbolic demand
 * resolution that feeds site selection. The Resources router is the sole executable aggregate;
 * step authoring continues to reference the contract.
 */
const demand = createDomainSubdomainRouter(contract, {
  planAquaticResources,
  planCultivatedResources,
  planGeologicalResources,
  planResourceGroups,
  planTerrestrialResources,
  resolveResourceDemands,
});

export default demand;
