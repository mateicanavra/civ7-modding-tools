import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computePlateTopology from "./ops/compute-plate-topology/index.js";
import computePlatesTensors from "./ops/compute-plates-tensors/index.js";

/**
 * Canonically binds the Projection contract to tile-space plate tensors and topology derived from
 * Foundation truth. The Foundation router is the sole executable aggregate; this branch feeds
 * downstream physics and never projects into the Civ7 engine.
 */
const projection = createDomainSubdomainRouter(contract, {
  computePlatesTensors,
  computePlateTopology,
});

export default projection;
