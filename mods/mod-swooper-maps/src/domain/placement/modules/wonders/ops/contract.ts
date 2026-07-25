import PlanNaturalWondersContract from "./plan-natural-wonders/contract.js";
import PlanWondersContract from "./plan-wonders/contract.js";

/** Wonder-planning operation contracts ordered from demand to site selection. */
const contracts = {
  planWonders: PlanWondersContract,
  planNaturalWonders: PlanNaturalWondersContract,
} as const;

export default contracts;
