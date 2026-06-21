import ComputeBaseTopographyContract from "./compute-base-topography/contract.js";
import ComputeBeltDriversContract from "./compute-belt-drivers/contract.js";
import ComputeCoastalAdjacencyContract from "./compute-coastal-adjacency/contract.js";
import ComputeCoastlineMetricsContract from "./compute-coastline-metrics/contract.js";
import ComputeDistanceToCoastContract from "./compute-distance-to-coast/contract.js";
import ComputeFlowRoutingContract from "./compute-flow-routing/contract.js";
import ComputeGeomorphicCycleContract from "./compute-geomorphic-cycle/contract.js";
import ComputeLandmaskContract from "./compute-landmask/contract.js";
import ComputeLandmassesContract from "./compute-landmasses/contract.js";
import ComputeSeaLevelContract from "./compute-sea-level/contract.js";
import ComputeShelfMaskContract from "./compute-shelf-mask/contract.js";
import ComputeSubstrateContract from "./compute-substrate/contract.js";
import PlanFoothillsContract from "./plan-foothills/contract.js";
import PlanIslandChainsContract from "./plan-island-chains/contract.js";
import PlanRidgesContract from "./plan-ridges/contract.js";
import PlanRoughLandsContract from "./plan-rough-lands/contract.js";
import PlanVolcanoesContract from "./plan-volcanoes/contract.js";
import ReconcileHeightfieldFromCoastContract from "./reconcile-heightfield-from-coast/contract.js";

export const contracts = {
  computeBaseTopography: ComputeBaseTopographyContract,
  computeBeltDrivers: ComputeBeltDriversContract,
  computeCoastalAdjacency: ComputeCoastalAdjacencyContract,
  computeCoastlineMetrics: ComputeCoastlineMetricsContract,
  computeDistanceToCoast: ComputeDistanceToCoastContract,
  computeFlowRouting: ComputeFlowRoutingContract,
  computeGeomorphicCycle: ComputeGeomorphicCycleContract,
  computeLandmask: ComputeLandmaskContract,
  computeLandmasses: ComputeLandmassesContract,
  computeShelfMask: ComputeShelfMaskContract,
  computeSeaLevel: ComputeSeaLevelContract,
  computeSubstrate: ComputeSubstrateContract,
  planIslandChains: PlanIslandChainsContract,
  planFoothills: PlanFoothillsContract,
  planRidges: PlanRidgesContract,
  planRoughLands: PlanRoughLandsContract,
  planVolcanoes: PlanVolcanoesContract,
  reconcileHeightfieldFromCoast: ReconcileHeightfieldFromCoastContract,
} as const;

export default contracts;
