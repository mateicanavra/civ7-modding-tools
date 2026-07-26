import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeGeomorphicCycleContract from "../../contract.js";
import { computeGeomorphicDeltas } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Binds the `stream-power-diffusion` algorithm to the shared `morphology/compute-geomorphic-cycle` operation contract. */
export default createStrategy(ComputeGeomorphicCycleContract, StrategyDefinition, {
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
