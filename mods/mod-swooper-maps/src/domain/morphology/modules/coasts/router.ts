import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeCoastalAdjacency from "./ops/compute-coastal-adjacency/index.js";
import computeCoastlineMetrics from "./ops/compute-coastline-metrics/index.js";
import computeDistanceToCoast from "./ops/compute-distance-to-coast/index.js";
import computeSculptContinentalMargin from "./ops/compute-sculpt-continental-margin/index.js";
import reconcileHeightfieldFromCoast from "./ops/reconcile-heightfield-from-coast/index.js";

/** Executable Morphology coasts branch bound to its admitted operation implementations. */
const coasts = createDomainSubdomainRouter(contract, {
  computeSculptContinentalMargin,
  computeCoastlineMetrics,
  reconcileHeightfieldFromCoast,
  computeCoastalAdjacency,
  computeDistanceToCoast,
});
export default coasts;
