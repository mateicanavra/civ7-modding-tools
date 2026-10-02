import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeGeomorphicCycleContract from "../../contract.js";
import { evolveHillslopeSurface } from "../../rules/hillslope-diffusion.js";
import StrategyDefinition from "./config.js";

export default createStrategy(ComputeGeomorphicCycleContract, StrategyDefinition, {
  run: (input, config) => evolveHillslopeSurface({
    width: input.width,
    height: input.height,
    elevation: input.elevation,
    seaLevel: input.seaLevel,
    landMask: input.landMask,
    erodibility: input.erodibilityK,
    sedimentDepth: input.sedimentDepth,
    config,
  }),
});
