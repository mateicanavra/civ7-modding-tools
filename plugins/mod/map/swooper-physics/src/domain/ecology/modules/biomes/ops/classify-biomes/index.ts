import { createOp } from "@swooper/mapgen-core/authoring";

import BiomeClassificationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Classifies admitted climate and soil fields into biome indices and vegetation density, then smooths only land-biome edges. */
export default createOp(BiomeClassificationContract, { strategies });
