import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import coasts from "./modules/coasts/router.js";
import erosion from "./modules/erosion/router.js";
import landforms from "./modules/landforms/router.js";
import routing from "./modules/routing/router.js";
import shelf from "./modules/shelf/router.js";
import terrain from "./modules/terrain/router.js";

/** Executable Morphology router consumed by recipe compilation. */
const morphology = createDomainRouter(contract, {
  terrain,
  coasts,
  routing,
  erosion,
  landforms,
  shelf,
});

export default morphology;
