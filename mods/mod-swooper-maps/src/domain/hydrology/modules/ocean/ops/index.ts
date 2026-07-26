import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import computeOceanGeometry from "./compute-ocean-geometry/index.js";
import computeOceanSurfaceCurrents from "./compute-ocean-surface-currents/index.js";
import computeOceanThermalState from "./compute-ocean-thermal-state/index.js";

type Contracts = typeof import("./contract.js").default;

/** Ocean implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeOceanGeometry,
  computeOceanSurfaceCurrents,
  computeOceanThermalState,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
