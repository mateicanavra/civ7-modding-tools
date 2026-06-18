import PlanNaturalWondersContract from "./plan-natural-wonders/contract.js";
import PlanStartsContract from "./plan-starts/contract.js";
import PlanWondersContract from "./plan-wonders/contract.js";

export const contracts = {
  planNaturalWonders: PlanNaturalWondersContract,
  planStarts: PlanStartsContract,
  planWonders: PlanWondersContract,
} as const;

export default contracts;

export { PlanNaturalWondersContract, PlanStartsContract, PlanWondersContract };
