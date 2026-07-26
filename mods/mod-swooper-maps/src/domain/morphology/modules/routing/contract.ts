import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeFlowRoutingContract from "./ops/compute-flow-routing/contract.js";

/** Routing branch contract for deriving geomorphic flow evidence from carved relief before erosion. */
const routing = defineDomainSubdomain({
  id: "routing",
  ops: { computeFlowRouting: ComputeFlowRoutingContract },
});
export default routing;
