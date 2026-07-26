import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCoastlineMetricsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Carves plate-aware coastlines and returns the resulting land, coast, and adjacency masks. */
const computeCoastlineMetrics = createOp(ComputeCoastlineMetricsContract, { strategies });

export default computeCoastlineMetrics;
