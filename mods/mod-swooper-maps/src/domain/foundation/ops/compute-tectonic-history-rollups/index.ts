import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicHistoryRollupsContract from "./contract.js";
import { cumulativeEraRollupStrategy } from "./strategies/index.js";

const computeTectonicHistoryRollups = createOp(ComputeTectonicHistoryRollupsContract, {
  strategies: {
    "cumulative-era-rollup": cumulativeEraRollupStrategy,
  },
});

export default computeTectonicHistoryRollups;
