import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeShelfMask from "./ops/compute-shelf-mask/index.js";

/** Executable Morphology shelf branch bound to the admitted shelf-mask implementation. */
const shelf = createDomainSubdomainRouter(contract, {
  computeShelfMask,
});
export default shelf;
