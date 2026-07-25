import PlanStartsContract from "./plan-starts/contract.js";

/** Start-planning operation contracts keyed in causal execution order. */
const contracts = {
  planStarts: PlanStartsContract,
} as const;

export default contracts;
