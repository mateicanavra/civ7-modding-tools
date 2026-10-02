import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeBasinWaterBudgetContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable whole-elevation-cohort budget response for one active catchment. */
export default createOp(ComputeBasinWaterBudgetContract, { strategies });
