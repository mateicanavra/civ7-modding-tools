import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSavannaWoodlandContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm seasonal woodland from energy, water stress, and biomass evidence. */
export default createOp(ScoreVegetationSavannaWoodlandContract, { strategies });
