import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import biomes from "./modules/biomes/contract.js";
import features from "./modules/features/contract.js";
import pedology from "./modules/pedology/contract.js";
import plotEffects from "./modules/plot-effects/contract.js";

/** Ecology contract composed in causal order from soil classification through plot effects. */
const ecology = defineDomain("ecology", {
  pedology,
  biomes,
  features,
  plotEffects,
});

export default ecology;
