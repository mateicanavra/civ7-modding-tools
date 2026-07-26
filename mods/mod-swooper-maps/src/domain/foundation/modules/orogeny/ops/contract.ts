import ComputeCrustEvolutionContract from "./compute-crust-evolution/contract.js";

/** Orogeny operation contracts keyed for exact branch composition. */
const contracts = { computeCrustEvolution: ComputeCrustEvolutionContract } as const;

export default contracts;
