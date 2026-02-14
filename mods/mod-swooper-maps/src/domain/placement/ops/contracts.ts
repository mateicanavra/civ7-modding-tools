import PlanFloodplainsContract from "./plan-floodplains/contract.js";
import PlanResourcesContract from "./plan-resources/contract.js";
import PlanStartsContract from "./plan-starts/contract.js";
import PlanWondersContract from "./plan-wonders/contract.js";

export const contracts = {
  planFloodplains: PlanFloodplainsContract,
  planResources: PlanResourcesContract,
  planStarts: PlanStartsContract,
  planWonders: PlanWondersContract,
} as const;

export default contracts;

export { PlanFloodplainsContract, PlanResourcesContract, PlanStartsContract, PlanWondersContract };
