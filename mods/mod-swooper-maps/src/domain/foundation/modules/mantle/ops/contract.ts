import ComputeMantleForcingContract from "./compute-mantle-forcing/contract.js";
import ComputeMantlePotentialContract from "./compute-mantle-potential/contract.js";

/** Mantle operation contracts keyed for exact branch composition. */
const contracts = {
  computeMantlePotential: ComputeMantlePotentialContract,
  computeMantleForcing: ComputeMantleForcingContract,
} as const;

export default contracts;
