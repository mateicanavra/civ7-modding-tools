import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCoastlineMetricsContract from "./contract.js";
import { plateAwareCarvingStrategy } from "./strategies/index.js";

const computeCoastlineMetrics = createOp(ComputeCoastlineMetricsContract, {
  strategies: {
    "plate-aware-carving": plateAwareCarvingStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeCoastlineMetrics;
