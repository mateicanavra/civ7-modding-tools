import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSagebrushSteppeContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores semiarid open vegetation from energy, water stress, and biomass evidence. */
export default createOp(ScoreVegetationSagebrushSteppeContract, { strategies });
