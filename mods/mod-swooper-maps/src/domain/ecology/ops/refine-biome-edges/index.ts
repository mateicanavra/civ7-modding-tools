import { createOp } from "@swooper/mapgen-core/authoring";

import RefineBiomeEdgesContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Smooths land-biome boundaries over the hex grid while retaining the water sentinel unchanged. */
export default createOp(RefineBiomeEdgesContract, { strategies });
