import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeCoastalAdjacency from "./ops/compute-coastal-adjacency/index.js";
import computeCoastlineMetrics from "./ops/compute-coastline-metrics/index.js";
import computeDistanceToCoast from "./ops/compute-distance-to-coast/index.js";
import computeSculptContinentalMargin from "./ops/compute-sculpt-continental-margin/index.js";
import reconcileHeightfieldFromCoast from "./ops/reconcile-heightfield-from-coast/index.js";

/**
 * Canonically binds the Coasts contract to margin sculpting, coastline measurement, heightfield
 * reconciliation, and coast-distance implementations that establish carved relief. The Morphology
 * router is the sole executable aggregate; step authoring continues to reference the contract.
 */
const coasts = createDomainSubdomainRouter(contract, {
  computeSculptContinentalMargin,
  computeCoastlineMetrics,
  reconcileHeightfieldFromCoast,
  computeCoastalAdjacency,
  computeDistanceToCoast,
});
export default coasts;
