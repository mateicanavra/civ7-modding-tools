import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeCoastalAdjacency from "./ops/compute-coastal-adjacency/index.js";
import computeDistanceToCoast from "./ops/compute-distance-to-coast/index.js";
import computeSculptContinentalMargin from "./ops/compute-sculpt-continental-margin/index.js";

/**
 * Binds the Coasts contract to continental-margin sculpting, shoreline adjacency,
 * and coast-distance implementations.
 */
const coasts = createDomainSubdomainRouter(contract, {
  computeSculptContinentalMargin,
  computeCoastalAdjacency,
  computeDistanceToCoast,
});
export default coasts;
