import PlanDiscoveriesContract from "./plan-discoveries/contract.js";
import PlanFloodplainsContract from "./plan-floodplains/contract.js";
import PlanNaturalWondersContract from "./plan-natural-wonders/contract.js";
import PlanResourcesContract from "./plan-resources/contract.js";
import PlanStartsContract from "./plan-starts/contract.js";
import PlanWondersContract from "./plan-wonders/contract.js";

export const contracts = {
  planDiscoveries: PlanDiscoveriesContract,
  planFloodplains: PlanFloodplainsContract,
  planNaturalWonders: PlanNaturalWondersContract,
  planResources: PlanResourcesContract,
  planStarts: PlanStartsContract,
  planWonders: PlanWondersContract,
} as const;

export default contracts;

export {
  PlanDiscoveriesContract,
  PlanFloodplainsContract,
  PlanNaturalWondersContract,
  PlanResourcesContract,
  PlanStartsContract,
  PlanWondersContract,
};
