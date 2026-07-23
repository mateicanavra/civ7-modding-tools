import { createStrategy } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "../../contract.js";
import { classifyPedology } from "../../rules/index.js";
import StrategyContract from "./contract.js";

/** Applies the authored pedology weights without profile-specific amplification. */
const balancedStrategy = createStrategy(PedologyClassifyContract, StrategyContract, {
  run: classifyPedology,
});

export default balancedStrategy;
