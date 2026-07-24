import ComputeLandmassesContract from "./compute-landmasses/contract.js";
import PlanFoothillsContract from "./plan-foothills/contract.js";
import PlanIslandChainsContract from "./plan-island-chains/contract.js";
import PlanRidgesContract from "./plan-ridges/contract.js";
import PlanRoughLandsContract from "./plan-rough-lands/contract.js";
import PlanVolcanoesContract from "./plan-volcanoes/contract.js";

/** Landforms operation contracts keyed for exact branch composition. */
const contracts = {
  planIslandChains: PlanIslandChainsContract,
  computeLandmasses: ComputeLandmassesContract,
  planRidges: PlanRidgesContract,
  planFoothills: PlanFoothillsContract,
  planRoughLands: PlanRoughLandsContract,
  planVolcanoes: PlanVolcanoesContract,
} as const;
export default contracts;
