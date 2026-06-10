import DeriveHabitatFieldsContract from "./derive-habitat-fields/contract.js";
import PlanAquaticResourcesContract from "./plan-aquatic-resources/contract.js";
import PlanCultivatedResourcesContract from "./plan-cultivated-resources/contract.js";
import PlanGeologicalResourcesContract from "./plan-geological-resources/contract.js";
import PlanResourceGroupsContract from "./plan-resource-groups/contract.js";
import PlanTerrestrialResourcesContract from "./plan-terrestrial-resources/contract.js";
import SelectResourceSitesContract from "./select-resource-sites/contract.js";

export const contracts = {
  deriveHabitatFields: DeriveHabitatFieldsContract,
  planAquaticResources: PlanAquaticResourcesContract,
  planCultivatedResources: PlanCultivatedResourcesContract,
  planGeologicalResources: PlanGeologicalResourcesContract,
  planResourceGroups: PlanResourceGroupsContract,
  planTerrestrialResources: PlanTerrestrialResourcesContract,
  selectResourceSites: SelectResourceSitesContract,
} as const;

export default contracts;

export {
  DeriveHabitatFieldsContract,
  PlanAquaticResourcesContract,
  PlanCultivatedResourcesContract,
  PlanGeologicalResourcesContract,
  PlanResourceGroupsContract,
  PlanTerrestrialResourcesContract,
  SelectResourceSitesContract,
};
