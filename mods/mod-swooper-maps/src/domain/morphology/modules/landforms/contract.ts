import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeLandmassesContract from "./ops/compute-landmasses/contract.js";
import PlanFoothillsContract from "./ops/plan-foothills/contract.js";
import PlanIslandChainsContract from "./ops/plan-island-chains/contract.js";
import PlanRidgesContract from "./ops/plan-ridges/contract.js";
import PlanRoughLandsContract from "./ops/plan-rough-lands/contract.js";
import PlanVolcanoesContract from "./ops/plan-volcanoes/contract.js";

/** Landforms branch contract for connected land, relief features, and volcanic intent. */
const landforms = defineDomainSubdomain({
  id: "landforms",
  ops: {
    planIslandChains: PlanIslandChainsContract,
    computeLandmasses: ComputeLandmassesContract,
    planRidges: PlanRidgesContract,
    planFoothills: PlanFoothillsContract,
    planRoughLands: PlanRoughLandsContract,
    planVolcanoes: PlanVolcanoesContract,
  },
});
export default landforms;
