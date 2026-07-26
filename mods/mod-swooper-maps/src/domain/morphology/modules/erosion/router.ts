import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeGeomorphicCycle from "./ops/compute-geomorphic-cycle/index.js";

/** Executable Morphology erosion branch bound to its geomorphic-cycle implementation. */
const erosion = createDomainSubdomainRouter(contract, {
  computeGeomorphicCycle,
});
export default erosion;
