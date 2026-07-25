import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeLandmasses from "./ops/compute-landmasses/index.js";
import planFoothills from "./ops/plan-foothills/index.js";
import planIslandChains from "./ops/plan-island-chains/index.js";
import planRidges from "./ops/plan-ridges/index.js";
import planRoughLands from "./ops/plan-rough-lands/index.js";
import planVolcanoes from "./ops/plan-volcanoes/index.js";

/** Executable Morphology landforms branch bound to its admitted operation implementations. */
const landforms = createDomainSubdomainRouter(contract, {
  planIslandChains,
  computeLandmasses,
  planRidges,
  planFoothills,
  planRoughLands,
  planVolcanoes,
});
export default landforms;
