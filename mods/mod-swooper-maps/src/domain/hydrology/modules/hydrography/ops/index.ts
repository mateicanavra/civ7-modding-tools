import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import accumulateDischarge from "./accumulate-discharge/index.js";
import computeDrainageRouting from "./compute-drainage-routing/index.js";
import classifyRiverNetwork from "./classify-river-network/index.js";
import planLakes from "./plan-lakes/index.js";
import projectRiverNetwork from "./project-river-network/index.js";

type Contracts = typeof import("./contract.js").default;

/** Hydrography implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeDrainageRouting,
  accumulateDischarge,
  projectRiverNetwork,
  planLakes,
  classifyRiverNetwork,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
