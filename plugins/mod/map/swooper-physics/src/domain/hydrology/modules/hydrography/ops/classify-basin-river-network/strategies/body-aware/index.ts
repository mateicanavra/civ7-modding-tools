import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import definition from "./config.js";
import { classifyBasinRiverNetwork } from "../../rules/index.js";
/** Classifies the complete physical basin ledger using the authored high-order confluence area gate. */
export default createStrategy(contract, definition, {
  run: (input, config) =>
    classifyBasinRiverNetwork(input, config.highOrderConfluenceUpstreamAreaMin),
});
