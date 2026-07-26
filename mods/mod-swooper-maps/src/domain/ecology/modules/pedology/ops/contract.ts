import PedologyClassifyContract from "./pedology-classify/contract.js";

/** Pedology operation contracts keyed in causal execution order. */
const contracts = {
  classifyPedology: PedologyClassifyContract,
} as const;

export default contracts;
