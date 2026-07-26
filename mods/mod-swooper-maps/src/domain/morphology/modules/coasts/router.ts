import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Morphology coasts branch bound to its admitted operation implementations. */
const coasts = createDomainSubdomainRouter(contract, implementations);
export default coasts;
