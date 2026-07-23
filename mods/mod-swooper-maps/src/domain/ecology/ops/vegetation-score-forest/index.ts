import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationForestContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores temperate humid forest habitat from energy, water, stress, biomass, and fertility evidence. */
export default createOp(ScoreVegetationForestContract, { strategies });
