import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputePlateTopologyContract from "./ops/compute-plate-topology/contract.js";
import ComputePlatesTensorsContract from "./ops/compute-plates-tensors/contract.js";

/** Projection branch contract for tile-space tensors and plate topology. */
const projection = defineDomainSubdomain({
  id: "projection",
  ops: {
    computePlatesTensors: ComputePlatesTensorsContract,
    computePlateTopology: ComputePlateTopologyContract,
  },
});

export default projection;
