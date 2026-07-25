import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeCrustContract from "./ops/compute-crust/contract.js";
import ComputePlateGraphContract from "./ops/compute-plate-graph/contract.js";

/** Lithosphere branch contract for initial crust and plate partitioning. */
const lithosphere = defineDomainSubdomain({
  id: "lithosphere",
  ops: {
    computeCrust: ComputeCrustContract,
    computePlateGraph: ComputePlateGraphContract,
  },
});

export default lithosphere;
