import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCryosphereStateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Translates admitted climate into snow, sea ice, albedo, freeze, permafrost, and melt state. */
export default createOp(ComputeCryosphereStateContract, { strategies });
