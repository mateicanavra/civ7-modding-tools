import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import biomes from "./modules/biomes/router.js";
import features from "./modules/features/router.js";
import pedology from "./modules/pedology/router.js";
import plotEffects from "./modules/plot-effects/router.js";

/** Executable Ecology router consumed by recipe compilation. */
const ecology = createDomainRouter(contract, {
  pedology,
  biomes,
  features,
  plotEffects,
});

export default ecology;
