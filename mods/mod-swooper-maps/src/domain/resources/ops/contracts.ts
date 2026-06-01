import PlanAquaticResourcesContract from "./plan-aquatic-resources/contract.js";
import PlanCultivatedResourcesContract from "./plan-cultivated-resources/contract.js";
import PlanGeologicalResourcesContract from "./plan-geological-resources/contract.js";
import PlanResourceGroupsContract from "./plan-resource-groups/contract.js";
import PlanTerrestrialResourcesContract from "./plan-terrestrial-resources/contract.js";

export const contracts = {
  planAquaticResources: PlanAquaticResourcesContract,
  planCultivatedResources: PlanCultivatedResourcesContract,
  planGeologicalResources: PlanGeologicalResourcesContract,
  planResourceGroups: PlanResourceGroupsContract,
  planTerrestrialResources: PlanTerrestrialResourcesContract,
} as const;

export default contracts;

export {
  PlanAquaticResourcesContract,
  PlanCultivatedResourcesContract,
  PlanGeologicalResourcesContract,
  PlanResourceGroupsContract,
  PlanTerrestrialResourcesContract,
};
