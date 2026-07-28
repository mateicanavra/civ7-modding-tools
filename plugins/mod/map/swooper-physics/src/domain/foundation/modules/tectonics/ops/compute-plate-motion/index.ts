import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlateMotionContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Fits per-plate rigid motion while retaining residual evidence for downstream judgments. */
const computePlateMotion = createOp(ComputePlateMotionContract, { strategies });

export default computePlateMotion;
