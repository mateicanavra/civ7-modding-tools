import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import classifyPedology from "./ops/pedology-classify/index.js";

/** Executable Ecology pedology branch. */
const pedology = createDomainSubdomainRouter(contract, {
  classifyPedology,
});

export default pedology;
