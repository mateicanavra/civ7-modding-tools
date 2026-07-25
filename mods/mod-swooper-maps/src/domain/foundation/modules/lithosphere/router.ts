import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeCrust from "./ops/compute-crust/index.js";
import computePlateGraph from "./ops/compute-plate-graph/index.js";

/** Executable Foundation lithosphere branch. */
const lithosphere = createDomainSubdomainRouter(contract, {
  computeCrust,
  computePlateGraph,
});

export default lithosphere;
