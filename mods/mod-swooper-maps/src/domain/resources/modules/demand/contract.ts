import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import PlanAquaticResourcesContract from "./ops/plan-aquatic-resources/contract.js";
import PlanCultivatedResourcesContract from "./ops/plan-cultivated-resources/contract.js";
import PlanGeologicalResourcesContract from "./ops/plan-geological-resources/contract.js";
import PlanResourceGroupsContract from "./ops/plan-resource-groups/contract.js";
import PlanTerrestrialResourcesContract from "./ops/plan-terrestrial-resources/contract.js";

/** Resource-demand contract over the four family planners and their group rollup. */
const demand = defineDomainSubdomain({
  id: "demand",
  ops: {
    planAquaticResources: PlanAquaticResourcesContract,
    planCultivatedResources: PlanCultivatedResourcesContract,
    planGeologicalResources: PlanGeologicalResourcesContract,
    planResourceGroups: PlanResourceGroupsContract,
    planTerrestrialResources: PlanTerrestrialResourcesContract,
  },
});

export default demand;
