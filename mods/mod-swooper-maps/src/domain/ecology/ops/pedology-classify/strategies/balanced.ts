import { createStrategy } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "../contract.js";
import { classifyPedology } from "../rules/index.js";

/** Applies the authored pedology weights without profile-specific amplification. */
export const balancedStrategy = createStrategy(PedologyClassifyContract, "balanced", {
  run: classifyPedology,
});
