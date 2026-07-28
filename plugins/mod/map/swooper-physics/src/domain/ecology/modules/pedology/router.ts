import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import classifyPedology from "./ops/pedology-classify/index.js";

/**
 * Canonically binds the Pedology contract to soil classification, which turns physical and climate
 * evidence into the soil vintage consumed by biomes and feature scoring. The Ecology router is the
 * sole executable aggregate; step authoring continues to reference the contract.
 */
const pedology = createDomainSubdomainRouter(contract, {
  classifyPedology,
});

export default pedology;
