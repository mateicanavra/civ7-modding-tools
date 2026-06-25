import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeBaseTopography from "./compute-base-topography/index.js";
import computeBeltDrivers from "./compute-belt-drivers/index.js";
import computeCoastlineMetrics from "./compute-coastline-metrics/index.js";
import computeDistanceToCoast from "./compute-distance-to-coast/index.js";
import computeFlowRouting from "./compute-flow-routing/index.js";
import computeGeomorphicCycle from "./compute-geomorphic-cycle/index.js";
import computeLandmask from "./compute-landmask/index.js";
import computeLandmasses from "./compute-landmasses/index.js";
import computeSeaLevel from "./compute-sea-level/index.js";
import computeShelfMask from "./compute-shelf-mask/index.js";
import computeSubstrate from "./compute-substrate/index.js";
import type { contracts } from "./contracts.js";
import planFoothills from "./plan-foothills/index.js";
import planIslandChains from "./plan-island-chains/index.js";
import planRidges from "./plan-ridges/index.js";
import planRoughLands from "./plan-rough-lands/index.js";
import planVolcanoes from "./plan-volcanoes/index.js";
import reconcileHeightfieldFromCoast from "./reconcile-heightfield-from-coast/index.js";

const implementations = {
  computeBaseTopography,
  computeBeltDrivers,
  computeCoastlineMetrics,
  computeDistanceToCoast,
  computeFlowRouting,
  computeGeomorphicCycle,
  computeLandmask,
  computeLandmasses,
  computeShelfMask,
  computeSeaLevel,
  computeSubstrate,
  planIslandChains,
  planFoothills,
  planRidges,
  planRoughLands,
  planVolcanoes,
  reconcileHeightfieldFromCoast,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export type { MountainsConfig } from "./mountains-shared/config.js";
export {
  computeBaseTopography,
  computeBeltDrivers,
  computeCoastlineMetrics,
  computeDistanceToCoast,
  computeFlowRouting,
  computeGeomorphicCycle,
  computeLandmask,
  computeLandmasses,
  computeSeaLevel,
  computeShelfMask,
  computeSubstrate,
  planFoothills,
  planIslandChains,
  planRidges,
  planRoughLands,
  planVolcanoes,
  reconcileHeightfieldFromCoast,
};
