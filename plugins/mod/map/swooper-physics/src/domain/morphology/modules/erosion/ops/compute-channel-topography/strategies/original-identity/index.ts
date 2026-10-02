import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeChannelTopographyContract from "../../contract.js";
import { sealChannelTopography } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

export default createStrategy(ComputeChannelTopographyContract, StrategyDefinition, {
  run: (input) => sealChannelTopography(input),
});
