import ComputeCrustContract from "./compute-crust/contract.js";
import ComputePlateGraphContract from "./compute-plate-graph/contract.js";

/** Lithosphere operation contracts keyed for exact branch composition. */
const contracts = {
  computeCrust: ComputeCrustContract,
  computePlateGraph: ComputePlateGraphContract,
} as const;

export default contracts;
