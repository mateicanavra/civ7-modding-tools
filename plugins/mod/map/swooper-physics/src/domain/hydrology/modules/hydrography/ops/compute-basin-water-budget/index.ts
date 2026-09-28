import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeBasinWaterBudgetContract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(ComputeBasinWaterBudgetContract, { strategies });
