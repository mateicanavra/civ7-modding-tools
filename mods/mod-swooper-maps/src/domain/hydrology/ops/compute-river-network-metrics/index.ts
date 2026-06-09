import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeRiverNetworkMetricsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeRiverNetworkMetrics = createOp(ComputeRiverNetworkMetricsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeRiverNetworkMetrics;
