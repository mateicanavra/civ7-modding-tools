import { createStrategy } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "../../contract.js";
import { classifyPedology } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Applies the authored pedology weights without profile-specific amplification. */
const balancedStrategy = createStrategy(PedologyClassifyContract, StrategyDefinition, {
  run: classifyPedology,
});

export default balancedStrategy;
