import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeCoastalAdjacency from "./compute-coastal-adjacency/index.js";
import computeCoastlineMetrics from "./compute-coastline-metrics/index.js";
import computeDistanceToCoast from "./compute-distance-to-coast/index.js";
import computeSculptContinentalMargin from "./compute-sculpt-continental-margin/index.js";
import reconcileHeightfieldFromCoast from "./reconcile-heightfield-from-coast/index.js";
type Contracts = typeof import("./contract.js").default;

/** Coasts implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeSculptContinentalMargin,
  computeCoastlineMetrics,
  reconcileHeightfieldFromCoast,
  computeCoastalAdjacency,
  computeDistanceToCoast,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
export default implementations;
