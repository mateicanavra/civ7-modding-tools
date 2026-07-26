import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeLandmasses from "./compute-landmasses/index.js";
import planFoothills from "./plan-foothills/index.js";
import planIslandChains from "./plan-island-chains/index.js";
import planRidges from "./plan-ridges/index.js";
import planRoughLands from "./plan-rough-lands/index.js";
import planVolcanoes from "./plan-volcanoes/index.js";
type Contracts = typeof import("./contract.js").default;

/** Landforms implementations keyed exactly like the branch contract registry. */
const implementations = {
  planIslandChains,
  computeLandmasses,
  planRidges,
  planFoothills,
  planRoughLands,
  planVolcanoes,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
export default implementations;
