import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeMesh from "./ops/compute-mesh/index.js";

/** Executable Foundation mesh branch. */
const mesh = createDomainSubdomainRouter(contract, {
  computeMesh,
});

export default mesh;
