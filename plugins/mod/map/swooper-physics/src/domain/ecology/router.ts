import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import biomes from "./modules/biomes/router.js";
import features from "./modules/features/router.js";
import pedology from "./modules/pedology/router.js";
import plotEffects from "./modules/plot-effects/router.js";

/**
 * Binds Ecology's soil, biome, feature, and plot-effect contracts to the executable chain that
 * turns physical evidence into Ecology truth and placement intent. Recipe runtime compilation
 * consumes this router; step authoring imports the contract-only domain.
 */
const ecology = createDomainRouter(contract, {
  pedology,
  biomes,
  features,
  plotEffects,
});

export default ecology;
