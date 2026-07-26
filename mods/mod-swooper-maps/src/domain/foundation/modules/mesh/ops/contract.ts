import ComputeMeshContract from "./compute-mesh/contract.js";

/** Mesh operation contracts keyed for exact branch composition. */
const contracts = { computeMesh: ComputeMeshContract } as const;

export default contracts;
