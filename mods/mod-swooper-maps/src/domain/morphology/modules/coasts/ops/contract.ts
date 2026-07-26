import ComputeCoastalAdjacencyContract from "./compute-coastal-adjacency/contract.js";
import ComputeCoastlineMetricsContract from "./compute-coastline-metrics/contract.js";
import ComputeDistanceToCoastContract from "./compute-distance-to-coast/contract.js";
import ComputeSculptContinentalMarginContract from "./compute-sculpt-continental-margin/contract.js";
import ReconcileHeightfieldFromCoastContract from "./reconcile-heightfield-from-coast/contract.js";

/** Coasts operation contracts keyed for exact branch composition. */
const contracts = {
  computeSculptContinentalMargin: ComputeSculptContinentalMarginContract,
  computeCoastlineMetrics: ComputeCoastlineMetricsContract,
  reconcileHeightfieldFromCoast: ReconcileHeightfieldFromCoastContract,
  computeCoastalAdjacency: ComputeCoastalAdjacencyContract,
  computeDistanceToCoast: ComputeDistanceToCoastContract,
} as const;
export default contracts;
