import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeIslandTopography from "./ops/compute-island-topography/index.js";
import computeLandmasses from "./ops/compute-landmasses/index.js";
import planFoothills from "./ops/plan-foothills/index.js";
import planRidges from "./ops/plan-ridges/index.js";
import planRoughLands from "./ops/plan-rough-lands/index.js";
import planVolcanoes from "./ops/plan-volcanoes/index.js";

/**
 * Canonically binds the Landforms contract to island topography, landmass decomposition, and
 * ridge, foothill, rough-land, and volcano planning. The Morphology router is the sole executable
 * aggregate; step authoring continues to reference the contract.
 */
const landforms = createDomainSubdomainRouter(contract, {
  computeIslandTopography,
  computeLandmasses,
  planRidges,
  planFoothills,
  planRoughLands,
  planVolcanoes,
});
export default landforms;
