import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeCoastalAdjacencyContract from "./ops/compute-coastal-adjacency/contract.js";
import ComputeCoastlineMetricsContract from "./ops/compute-coastline-metrics/contract.js";
import ComputeDistanceToCoastContract from "./ops/compute-distance-to-coast/contract.js";
import ComputeSculptContinentalMarginContract from "./ops/compute-sculpt-continental-margin/contract.js";
import ReconcileHeightfieldFromCoastContract from "./ops/reconcile-heightfield-from-coast/contract.js";

/** Coasts branch contract for margin sculpting, coastline metrics, and coastal topology. */
const coasts = defineDomainSubdomain({
  id: "coasts",
  ops: {
    computeSculptContinentalMargin: ComputeSculptContinentalMarginContract,
    computeCoastlineMetrics: ComputeCoastlineMetricsContract,
    reconcileHeightfieldFromCoast: ReconcileHeightfieldFromCoastContract,
    computeCoastalAdjacency: ComputeCoastalAdjacencyContract,
    computeDistanceToCoast: ComputeDistanceToCoastContract,
  },
});
export default coasts;
