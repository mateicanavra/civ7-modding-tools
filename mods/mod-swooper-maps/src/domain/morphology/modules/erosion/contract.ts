import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

/** Erosion branch contract for the geomorphic cycle that reshapes relief and substrate. */
const erosion = defineDomainSubdomain({ id: "erosion", ops });
export default erosion;
