import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import lithosphere from "./modules/lithosphere/router.js";
import mantle from "./modules/mantle/router.js";
import mesh from "./modules/mesh/router.js";
import orogeny from "./modules/orogeny/router.js";
import projection from "./modules/projection/router.js";
import tectonics from "./modules/tectonics/router.js";

/** Executable Foundation router consumed by recipe compilation. */
const foundation = createDomainRouter(contract, {
  mesh,
  mantle,
  lithosphere,
  tectonics,
  orogeny,
  projection,
});

export default foundation;
