import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeVegetationSubstrateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Normalizes climate and soil evidence into shared energy, water, stress, biomass, and fertility fields used by vegetation scorers. */
export default createOp(ComputeVegetationSubstrateContract, { strategies });
