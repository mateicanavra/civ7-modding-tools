import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeRiverNetworkMetricsContract from "./contract.js";
import { hydrographicClassificationStrategy } from "./strategies/index.js";

const computeRiverNetworkMetrics = createOp(ComputeRiverNetworkMetricsContract, {
  strategies: {
    "hydrographic-classification": hydrographicClassificationStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeRiverNetworkMetrics;
