import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationRainforestContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm humid closed-canopy habitat from energy, water, stress, and biomass evidence. */
export default createOp(ScoreVegetationRainforestContract, { strategies });
