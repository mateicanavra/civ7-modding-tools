import PlanNaturalWondersContract from "./plan-natural-wonders/contract.js";
import PlanStartsContract from "./plan-starts/contract.js";
import PlanWondersContract from "./plan-wonders/contract.js";

/**
 * Curated Placement operation contracts used to define the domain's public operation surface.
 * Keeping registration here makes contract identity independent from concrete strategy
 * implementations.
 */
export const contracts = {
  planNaturalWonders: PlanNaturalWondersContract,
  planStarts: PlanStartsContract,
  planWonders: PlanWondersContract,
} as const;

export default contracts;

export { PlanNaturalWondersContract, PlanStartsContract, PlanWondersContract };
