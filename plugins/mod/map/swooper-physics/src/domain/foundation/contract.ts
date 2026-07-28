import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import lithosphere from "./modules/lithosphere/contract.js";
import mantle from "./modules/mantle/contract.js";
import mesh from "./modules/mesh/contract.js";
import orogeny from "./modules/orogeny/contract.js";
import projection from "./modules/projection/contract.js";
import tectonics from "./modules/tectonics/contract.js";

/** Foundation contract composed in physical dependency order from mesh through projection. */
const foundation = defineDomain("foundation", {
  mesh,
  mantle,
  lithosphere,
  tectonics,
  orogeny,
  projection,
});

export default foundation;
