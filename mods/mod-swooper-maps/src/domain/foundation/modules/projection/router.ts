import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computePlateTopology from "./ops/compute-plate-topology/index.js";
import computePlatesTensors from "./ops/compute-plates-tensors/index.js";

/** Executable Foundation projection branch. */
const projection = createDomainSubdomainRouter(contract, {
  computePlatesTensors,
  computePlateTopology,
});

export default projection;
