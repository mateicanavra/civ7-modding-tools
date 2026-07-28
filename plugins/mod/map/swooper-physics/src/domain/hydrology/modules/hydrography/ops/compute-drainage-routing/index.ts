import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDrainageRoutingContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Resolves terrain flow, depressions, basins, sinks, and outlets for downstream hydrography. */
export default createOp(ComputeDrainageRoutingContract, { strategies });
