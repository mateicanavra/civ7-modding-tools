import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import coasts from "./modules/coasts/contract.js";
import erosion from "./modules/erosion/contract.js";
import landforms from "./modules/landforms/contract.js";
import routing from "./modules/routing/contract.js";
import shelf from "./modules/shelf/contract.js";
import terrain from "./modules/terrain/contract.js";

/** Morphology contract composed by physical production capability. */
const morphology = defineDomain("morphology", {
  terrain,
  coasts,
  routing,
  erosion,
  landforms,
  shelf,
});

export default morphology;
