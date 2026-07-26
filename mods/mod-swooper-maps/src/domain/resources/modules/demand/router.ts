import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planAquaticResources from "./ops/plan-aquatic-resources/index.js";
import planCultivatedResources from "./ops/plan-cultivated-resources/index.js";
import planGeologicalResources from "./ops/plan-geological-resources/index.js";
import planResourceGroups from "./ops/plan-resource-groups/index.js";
import planTerrestrialResources from "./ops/plan-terrestrial-resources/index.js";

/** Executable resource-demand branch. */
const demand = createDomainSubdomainRouter(contract, {
  planAquaticResources,
  planCultivatedResources,
  planGeologicalResources,
  planResourceGroups,
  planTerrestrialResources,
});

export default demand;
