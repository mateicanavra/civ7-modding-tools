import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandmassesContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Decomposes the land mask into wrapped-hex landmass components and bounds. */
const computeLandmasses = createOp(ComputeLandmassesContract, { strategies });

export default computeLandmasses;
