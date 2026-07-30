import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import coasts from "./modules/coasts/router.js";
import erosion from "./modules/erosion/router.js";
import landforms from "./modules/landforms/router.js";
import routing from "./modules/routing/router.js";
import shelf from "./modules/shelf/router.js";
import terrain from "./modules/terrain/router.js";

/**
 * Binds Morphology's terrain-through-shelf contracts to the executable chain that turns Foundation
 * evidence into final topography, substrate, landforms, and shelf truth. Recipe runtime compilation
 * consumes this router; step authoring imports the contract-only domain.
 */
const morphology = createDomainRouter(contract, {
  terrain,
  coasts,
  routing,
  erosion,
  landforms,
  shelf,
});

export default morphology;
