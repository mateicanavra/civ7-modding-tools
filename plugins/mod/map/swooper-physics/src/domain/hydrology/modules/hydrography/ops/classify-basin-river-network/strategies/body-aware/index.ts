import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import definition from "./config.js";
import { classifyBasinRiverNetwork } from "../../rules/index.js";
export default createStrategy(contract, definition, {
  run: (input, config) =>
    classifyBasinRiverNetwork(input, config.highOrderConfluenceUpstreamAreaMin),
});
