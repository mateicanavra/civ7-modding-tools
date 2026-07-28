import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import lithosphere from "./modules/lithosphere/router.js";
import mantle from "./modules/mantle/router.js";
import mesh from "./modules/mesh/router.js";
import orogeny from "./modules/orogeny/router.js";
import projection from "./modules/projection/router.js";
import tectonics from "./modules/tectonics/router.js";

/**
 * Binds Foundation's mesh-through-tile-projection contracts to the executable chain that produces
 * the recipe's deepest physical evidence. Recipe runtime compilation consumes this router; step
 * authoring imports the contract-only domain.
 */
const foundation = createDomainRouter(contract, {
  mesh,
  mantle,
  lithosphere,
  tectonics,
  orogeny,
  projection,
});

export default foundation;
