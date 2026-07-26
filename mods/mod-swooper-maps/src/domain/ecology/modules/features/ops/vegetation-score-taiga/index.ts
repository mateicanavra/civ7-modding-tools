import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationTaigaContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores cold forest habitat from energy, water, cold stress, and biomass evidence. */
export default createOp(ScoreVegetationTaigaContract, { strategies });
