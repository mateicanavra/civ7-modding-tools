import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

/** Routing branch contract for deriving geomorphic flow evidence from carved relief before erosion. */
const routing = defineDomainSubdomain({ id: "routing", ops });
export default routing;
