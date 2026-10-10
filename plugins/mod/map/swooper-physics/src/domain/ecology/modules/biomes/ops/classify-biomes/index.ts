import { createOp } from "@swooper/mapgen-core/authoring";

import BiomeClassificationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Classifies admitted climate and soil fields into local biome indices and vegetation density. */
export default createOp(BiomeClassificationContract, { strategies });
