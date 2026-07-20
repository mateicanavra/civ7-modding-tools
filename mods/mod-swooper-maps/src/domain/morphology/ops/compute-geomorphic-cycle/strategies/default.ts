import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeGeomorphicCycleContract from "../contract.js";
import { computeGeomorphicDeltas } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeGeomorphicCycleContract, "default", {
  run: (input, config) => {
    const {
      width,
      height,
      elevation,
      flowDir,
      flowAccum,
      erodibilityK: erodibility,
      sedimentDepth,
      landMask,
    } = input;

    return computeGeomorphicDeltas({
      width,
      height,
      elevation,
      flowDir,
      flowAccum,
      erodibility,
      sedimentDepth,
      landMask,
      config,
    });
  },
});
