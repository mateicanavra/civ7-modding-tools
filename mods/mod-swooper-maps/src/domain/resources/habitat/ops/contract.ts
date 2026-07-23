import DeriveHabitatFieldsContract from "./derive-habitat-fields/contract.js";

/** Habitat operation contracts keyed for exact subdomain composition. */
const contracts = {
  deriveHabitatFields: DeriveHabitatFieldsContract,
} as const;

export default contracts;
