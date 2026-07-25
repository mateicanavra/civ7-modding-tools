import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeMantleForcing from "./ops/compute-mantle-forcing/index.js";
import computeMantlePotential from "./ops/compute-mantle-potential/index.js";

/** Executable Foundation mantle branch. */
const mantle = createDomainSubdomainRouter(contract, {
  computeMantlePotential,
  computeMantleForcing,
});

export default mantle;
