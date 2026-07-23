import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicHistoryRollupsContract from "./contract.js";
import { cumulativeEraRollupStrategy } from "./strategies/index.js";

/** Aggregates era activity into the immutable history artifact consumed by orogeny and projection. */
const computeTectonicHistoryRollups = createOp(ComputeTectonicHistoryRollupsContract, {
  strategies: {
    "cumulative-era-rollup": cumulativeEraRollupStrategy,
  },
});

export default computeTectonicHistoryRollups;
