import SelectResourceSitesContract from "./select-resource-sites/contract.js";

/** Site-selection operation contracts keyed for exact subdomain composition. */
export const contracts = {
  selectResourceSites: SelectResourceSitesContract,
} as const;

export default contracts;

export { SelectResourceSitesContract };
