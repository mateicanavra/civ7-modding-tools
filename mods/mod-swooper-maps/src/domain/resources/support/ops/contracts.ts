import AdjustResourceSupportContract from "./adjust-resource-support/contract.js";

/** Resource-support operation contracts keyed for exact subdomain composition. */
export const contracts = {
  adjustResourceSupport: AdjustResourceSupportContract,
} as const;

export default contracts;

export { AdjustResourceSupportContract };
